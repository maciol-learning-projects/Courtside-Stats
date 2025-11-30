import { Router, Request, Response } from 'express';
import { nbaApiService } from '../services/nbaApiService';
import { start } from 'repl';

const router = Router();

// Interface for the chart data we're sending to frontend
interface ChartData {
  date: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  efficiency: number;
  opponent: string;
}

// Interface for player stats from our API service
interface PlayerStat {
  id: number;
  ast: number | null;
  blk: number | null;
  dreb: number | null;
  fg3_pct: number | null;
  fg3a: number | null;
  fg3m: number | null;
  fg_pct: number | null;
  fga: number | null;
  fgm: number | null;
  ft_pct: number | null;
  fta: number | null;
  ftm: number | null;
  min: string | null;
  oreb: number | null;
  pf: number | null;
  player: {
    id: number;
    first_name: string;
    last_name: string;
  };
  pts: number | null;
  reb: number | null;
  stl: number | null;
  team: {
    id: number;
    abbreviation: string;
    full_name: string;
  };
  turnover: number | null;
  game: {
    id: number;
    date: string;
    opponent?: string;
    home_team?: string;
    away_team?: string;
  };
}

// Interface for team data
interface Team {
  id: number;
  abbreviation: string;
  city: string;
  conference: string;
  division: string;
  full_name: string;
  name: string;
}

// Interface for player data
interface Player {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  team: Team;
}


const transformStatsToChartData = (stat: any): ChartData => {
  // Add proper null checks for all properties
  const dateString = stat.game?.date ? stat.game.date.split('T')[0] : 'Unknown Date';
  const opponent = stat.game?.opponent || 'Unknown';
  
  return {
    date: dateString,
    points: stat.pts || 0,
    rebounds: stat.reb || 0,
    assists: stat.ast || 0,
    steals: stat.stl || 0,
    blocks: stat.blk || 0,
    turnovers: stat.turnover || 0,
    fieldGoalPercentage: (stat.fg_pct || 0) * 100,
    threePointPercentage: (stat.fg3_pct || 0) * 100,
    efficiency: calculateEfficiency(stat),
    opponent: opponent
  };
};

// Also update calculateEfficiency to handle undefined values
const calculateEfficiency = (stat: any): number => {
  const points = stat.pts || 0;
  const rebounds = stat.reb || 0;
  const assists = stat.ast || 0;
  const steals = stat.stl || 0;
  const blocks = stat.blk || 0;
  const turnovers = stat.turnover || 0;
  
  // Simple efficiency formula: PTS + REB + AST + STL + BLK - TO
  return points + rebounds + assists + steals + blocks - turnovers;
};

/**
 * @route   GET /api/visualizations/player/:playerId
 * @desc    Get player performance data for visualizations using REAL GAME DATA
 * @access  Public
 */
router.get('/player/:playerId', async (req: Request, res: Response) => {
  try {
    const { playerId } = req.params;
    const { startDate, endDate } = req.query;

    if (!playerId) {
      return res.status(400).json({
        success: false,
        message: 'Player ID is required'
      });
    }

    console.log(`🔍 Fetching REAL GAME DATA for player ID: ${playerId}`);

    // Fetch REAL GAME STATS only
    const gameStatsResult = await nbaApiService.getPlayerGameStats({
      playerId: parseInt(playerId),
      startDate: startDate as string,
      endDate: endDate as string
    });

    console.log(`✅ Retrieved ${gameStatsResult.data.length} real games`);
    console.log(`🔍 Sample game data:`, JSON.stringify(gameStatsResult.data[0], null, 2));

    // Transform real game data
    const chartData: ChartData[] = gameStatsResult.data.map((gameStat: any) => 
      transformStatsToChartData(gameStat)
    );

    // Get player info
    const player = await nbaApiService.getPlayer(parseInt(playerId));
    const playerInfo = { name: `${player.first_name} ${player.last_name}` };

    // Calculate averages from REAL DATA
    const totalPoints = chartData.reduce((sum: number, game: ChartData) => sum + game.points, 0);
    const totalRebounds = chartData.reduce((sum: number, game: ChartData) => sum + game.rebounds, 0);
    const totalAssists = chartData.reduce((sum: number, game: ChartData) => sum + game.assists, 0);

    res.json({
      success: true,
      data: chartData,
      player: playerInfo,
      summary: {
        totalGames: chartData.length,
        avgPoints: chartData.length > 0 ? totalPoints / chartData.length : 0,
        avgRebounds: chartData.length > 0 ? totalRebounds / chartData.length : 0,
        avgAssists: chartData.length > 0 ? totalAssists / chartData.length : 0,
      },
      meta: gameStatsResult.meta
    });

  } catch (error) {
    console.error('❌ Real game data fetch failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real game data',
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Check API key, player ID, and date range'
    });
  }
});

/**
 * @route   GET /api/visualizations/players/comparison
 * @desc    Compare multiple players using real NBA data
 * @access  Public
 */
router.get('/players/comparison', async (req: Request, res: Response) => {
  try {
    const { playerIds, season = '2025' } = req.query;
    
    if (!playerIds || typeof playerIds !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Player IDs are required for comparison'
      });
    }

    const ids = playerIds.split(',').map(id => parseInt(id));
    const comparisonData = [];

    // Fetch data for each player
    for (const playerId of ids) {
      try {
        const statsResult = await nbaApiService.getPlayerGameStats({
          playerId: playerId,
          // Remove season parameter since getPlayerGameStats doesn't use it anymore
        });

        // Check if statsResult is valid before accessing data
        if (!statsResult || !statsResult.data) {
          console.warn(`No stats data for player ${playerId}`);
          continue; // Skip this player but continue with others
        }

        const playerData = await nbaApiService.getPlayer(playerId);
        
        // Use any[] instead of PlayerStat[] since we don't have strict typing
        const stats: any[] = statsResult.data;

        if (stats.length > 0) {
          const averages = calculatePlayerAverages(stats);
          comparisonData.push({
            playerId,
            playerName: `${playerData.first_name} ${playerData.last_name}`,
            team: playerData.team ? playerData.team.full_name : 'Unknown',
            position: playerData.position,
            ...averages
          });
        } else {
          console.warn(`No game stats found for player ${playerId}`);
        }
      } catch (error) {
        console.error(`Error processing player ${playerId}:`, error);
        // Continue with other players even if one fails
      }
    }

    if (comparisonData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No player data found for comparison'
      });
    }

    res.json({
      success: true,
      data: comparisonData,
      comparedPlayers: comparisonData.length,
      season: season
    });

  } catch (error) {
    console.error('Player comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch player comparison data'
    });
  }
});

// Interface for player averages
interface PlayerAverages {
  avgPoints: number;
  avgRebounds: number;
  avgAssists: number;
  avgSteals: number;
  avgBlocks: number;
  avgTurnovers: number;
  avgFieldGoalPercentage: number;
  avgThreePointPercentage: number;
  totalGames: number;
  efficiency: number;
}

/**
 * Helper function to calculate player averages
 */
function calculatePlayerAverages(stats: any[]): PlayerAverages {
  const totals = stats.reduce((acc, stat) => ({
    points: acc.points + (stat.pts || 0),
    rebounds: acc.rebounds + (stat.reb || 0),
    assists: acc.assists + (stat.ast || 0),
    steals: acc.steals + (stat.stl || 0),
    blocks: acc.blocks + (stat.blk || 0),
    turnovers: acc.turnovers + (stat.turnover || 0),
    fieldGoalPercentage: acc.fieldGoalPercentage + ((stat.fg_pct || 0) * 100),
    threePointPercentage: acc.threePointPercentage + ((stat.fg3_pct || 0) * 100),
    games: acc.games + 1
  }), {
    points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0,
    fieldGoalPercentage: 0, threePointPercentage: 0, games: 0
  });

  const games = totals.games || 1;

  return {
    avgPoints: totals.points / games,
    avgRebounds: totals.rebounds / games,
    avgAssists: totals.assists / games,
    avgSteals: totals.steals / games,
    avgBlocks: totals.blocks / games,
    avgTurnovers: totals.turnovers / games,
    avgFieldGoalPercentage: totals.fieldGoalPercentage / games,
    avgThreePointPercentage: totals.threePointPercentage / games,
    totalGames: totals.games,
    efficiency: (totals.points + totals.rebounds + totals.assists + totals.steals + totals.blocks - totals.turnovers) / games
  };
}

/**
 * @route   GET /api/visualizations/teams
 * @desc    Get team statistics and standings
 * @access  Public
 */
router.get('/teams', async (req: Request, res: Response) => {
  try {
    const teams = await nbaApiService.getTeams();
    
    // Transform team data for frontend
    const teamData = teams.map((team: Team) => ({
      id: team.id,
      name: team.full_name,
      city: team.city,
      abbreviation: team.abbreviation,
      conference: team.conference,
      division: team.division,
      // Mock stats - in real app, fetch from stats endpoint
      wins: Math.floor(Math.random() * 60) + 20,
      losses: Math.floor(Math.random() * 40) + 10,
      winPercentage: Math.random() * 0.5 + 0.5 // 0.5 to 1.0
    }));

    res.json({
      success: true,
      data: teamData
    });

  } catch (error) {
    console.error('Teams visualization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team data'
    });
  }
});

/**
 * @route   GET /api/visualizations/debug/dates
 * @desc    Check what dates have available game data
 * @access  Public
 */
router.get('/debug/dates', async (req: Request, res: Response) => {
  try {
    const dateResults = await nbaApiService.debugAvailableDates();
    
    res.json({
      success: true,
      current_date: new Date().toISOString().split('T')[0],
      nba_season: '2025-2026 (started Oct 21, 2025)',
      date_test_results: dateResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;