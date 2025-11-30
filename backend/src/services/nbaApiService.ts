import axios from 'axios';
import Player from '../models/Player.model';

/**
 * Smart NBA API Service with caching and development modes
 */
class NBAApiService {
  private baseURL = 'https://api.sportsdata.io/v3/nba';
  private apiKey = process.env.SPORTSDATA_API_KEY || '';
  private useRealAPI = process.env.USE_REAL_API !== 'false';
  private cacheTTL = 1000 * 60 * 60 * 24; // 24 hours

  /**
   * Get players with smart caching - USING CORRECT ENDPOINT
   */
  async getPlayers(page: number = 0, perPage: number = 25, forceRefresh: boolean = false) {
    // Always use cache in development unless forced
    if (!this.useRealAPI && !forceRefresh) {
      console.log('💻 DEVELOPMENT: Using cached/mock data');
      return this.getDevelopmentPlayers(page, perPage);
    }

    // Try to get from cache first
    if (!forceRefresh) {
      const cachedPlayers = await this.getCachedPlayers(page, perPage);
      if (cachedPlayers) {
        console.log('💾 Returning cached players');
        return cachedPlayers;
      }
    }

    // Fetch from real API and cache
    console.log('🔗 Fetching from SportsData API');
    try {
      const apiPlayers = await this.fetchFromSportsDataAPI();
      await this.cachePlayers(apiPlayers);
      
      // Return paginated results
      const start = page * perPage;
      const end = start + perPage;
      const paginatedPlayers = apiPlayers.slice(start, end);

      return {
        data: paginatedPlayers,
        meta: {
          total_pages: Math.ceil(apiPlayers.length / perPage),
          current_page: page,
          next_page: page < Math.ceil(apiPlayers.length / perPage) - 1 ? page + 1 : null,
          per_page: perPage,
          total_count: apiPlayers.length
        }
      };
    } catch (error) {
      console.error('❌ API failed, falling back to cache/development:', error);
      return this.getDevelopmentPlayers(page, perPage);
    }
  }

  /**
   * Fetch real data from SportsData.io - CORRECT ENDPOINT
   */
  private async fetchFromSportsDataAPI() {
    if (!this.apiKey) {
      console.warn('❌ No SportsData API key found, using development data');
      return this.getDevelopmentPlayers(0, 25).data;
    }

    try {
      // CORRECT ENDPOINT from documentation: PlayersActiveBasic
      const response = await axios.get(`${this.baseURL}/scores/json/PlayersActiveBasic`, {
        params: { key: this.apiKey },
        timeout: 10000
      });

      console.log(`✅ SportsData.io Players Response:`, {
        status: response.status,
        dataLength: response.data.length,
        sample: response.data[0]
      });

      // Transform SportsData.io PlayerBasic format to our app format
      return response.data.map((player: any) => ({
        id: player.PlayerID,
        first_name: player.FirstName,
        last_name: player.LastName,
        position: player.Position,
        height_feet: player.Height ? Math.floor(player.Height / 12) : null,
        height_inches: player.Height ? player.Height % 12 : null,
        weight_pounds: player.Weight,
        team: {
          id: player.TeamID,
          abbreviation: player.Team,
          city: this.getTeamCity(player.Team),
          full_name: player.Team ? `${this.getTeamCity(player.Team)} ${player.Team}` : 'Free Agent',
          name: player.Team
        }
      }));
    } catch (error: any) {
      console.error('❌ SportsData.io API error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Get specific player by ID - SMART APPROACH
   */
  async getPlayer(playerId: number) {
    if (!this.useRealAPI) {
      console.log('💻 DEVELOPMENT: Returning mock player data');
      return this.getDevelopmentPlayer(playerId);
    }

    try {
      // Get all players and find the one we want (more reliable than individual endpoint)
      const playersResponse = await this.getPlayers(0, 500); // Get first 500 players
      const player = playersResponse.data.find((p: any) => p.id === playerId);
      
      if (player) {
        console.log(`✅ Found player ${playerId}: ${player.first_name} ${player.last_name}`);
        return player;
      } else {
        console.warn(`❌ Player ${playerId} not found in active players`);
        return this.getDevelopmentPlayer(playerId);
      }
    } catch (error) {
      console.error(`Error fetching player ${playerId}:`, error);
      return this.getDevelopmentPlayer(playerId);
    }
  }

/**
 * Get player game-by-game statistics - DYNAMIC DATES
 */
async getPlayerGameStats(params: {
  playerId: number;
  season?: number;
  startDate?: string;
  endDate?: string;
}) {
  if (!this.useRealAPI || !this.apiKey) {
    throw new Error('Real API not available - check API key configuration');
  }

  // Use dynamic dates - season start to today
  const seasonStart = '2025-10-21'; // 2025-2026 season start
  const today = new Date().toISOString().split('T')[0] || ''; // Current date
  
  const startDate = params.startDate || seasonStart;
  const endDate = params.endDate || today;

  console.log(`📅 Fetching game data from ${startDate} to ${endDate} for player ${params.playerId}`);

  // Get all dates in the range
  const dates = this.getDatesInRange(startDate, endDate);
  let allPlayerGames: any[] = [];

  // Query each date in the range
  for (const date of dates) {
    try {
      const response = await axios.get(
        `${this.baseURL}/stats/json/PlayerGameStatsByDate/${date}`, 
        {
          params: { key: this.apiKey },
          timeout: 5000
        }
      );

      // Filter for our player and add to results
      const playerGamesOnDate = response.data.filter((game: any) => 
        game.PlayerID === params.playerId
      );
      
      allPlayerGames = [...allPlayerGames, ...playerGamesOnDate];
      
      if (playerGamesOnDate.length > 0) {
        console.log(`✅ Date ${date}: ${playerGamesOnDate.length} games for player`);
      }

    } catch (error: any) {
      console.warn(`⚠️ Could not fetch data for date ${date}:`, error.message);
      // Continue with other dates
    }
  }

  if (allPlayerGames.length === 0) {
    throw new Error(`No game data found for player ${params.playerId} in date range ${startDate} to ${endDate}`);
  }

  console.log(`🎯 Retrieved ${allPlayerGames.length} total games for player`);

  return {
    data: allPlayerGames.map((game: any) => {
    console.log(`🔍 Raw game data:`, JSON.stringify(game, null, 2)); // ADD THIS LINE
    
    return {
      id: game.StatID,
      ast: game.Assists,
      blk: game.BlockedShots,
      dreb: game.Rebounds - game.OffensiveRebounds,
      fg3_pct: game.ThreePointPercentage,
      fg3a: game.ThreePointAttempts,
      fg3m: game.ThreePointersMade,
      fg_pct: game.FieldGoalPercentage,
      fga: game.FieldGoalAttempts,
      fgm: game.FieldGoalsMade,
      ft_pct: game.FreeThrowPercentage,
      fta: game.FreeThrowAttempts,
      ftm: game.FreeThrowsMade,
      min: game.Minutes,
      oreb: game.OffensiveRebounds,
      pf: game.PersonalFouls,
      player: {
        id: game.PlayerID,
        first_name: game.FirstName || game.Name?.split(' ')[0] || 'Unknown',
        last_name: game.LastName || game.Name?.split(' ').slice(1).join(' ') || 'Player'
      },
      pts: game.Points,
      reb: game.Rebounds,
      stl: game.Steals,
      team: {
        id: game.TeamID,
        abbreviation: game.Team,
        full_name: `${this.getTeamCity(game.Team)} ${game.Team}`
      },
      turnover: game.Turnovers,
      game: {
        id: game.GameID,
        date: game.Day || game.Date,
        opponent: game.Opponent,
        home_team: game.HomeTeam,
        away_team: game.AwayTeam
      }
    };
  }),
    meta: {
      total_games: allPlayerGames.length,
      date_range: `${startDate} to ${endDate}`,
      data_source: 'SportsData.io Real Game Data',
      season: '2025-2026',
      queried_dates: dates.length,
      current_date: today
    }
  };
}

  /**
   * Get all NBA teams - CORRECT ENDPOINT
   */
  async getTeams() {
    if (!this.useRealAPI) {
      console.log('💻 DEVELOPMENT: Returning mock teams');
      return this.getDevelopmentTeams();
    }

    try {
      // CORRECT ENDPOINT from documentation
      const response = await axios.get(`${this.baseURL}/scores/json/teams`, {
        params: { key: this.apiKey },
        timeout: 10000
      });

      console.log(`✅ SportsData.io Teams Response:`, {
        status: response.status,
        dataLength: response.data.length,
        sample: response.data[0]
      });

      return response.data.map((team: any) => ({
        id: team.TeamID,
        abbreviation: team.Key,
        city: team.City,
        conference: team.Conference,
        division: team.Division,
        full_name: team.Name,
        name: team.Key
      }));
    } catch (error) {
      console.error('Error fetching teams:', error);
      return this.getDevelopmentTeams();
    }
  }

  /**
   * Find player by name to get correct ID
   */
  async findPlayerByName(firstName: string, lastName: string) {
    console.log(`🔍 Searching for player: ${firstName} ${lastName}`);
    
    try {
      const playersResponse = await this.getPlayers(0, 500);
      const player = playersResponse.data.find((p: any) => 
        p.first_name.toLowerCase().includes(firstName.toLowerCase()) && 
        p.last_name.toLowerCase().includes(lastName.toLowerCase())
      );

      if (player) {
        console.log(`✅ Found player: ${player.first_name} ${player.last_name} (ID: ${player.id})`);
        return player;
      } else {
        console.warn(`❌ Player not found: ${firstName} ${lastName}`);
        return null;
      }
    } catch (error) {
      console.error('Error searching player:', error);
      return null;
    }
  }

  // ========== CACHING METHODS ==========

  /**
   * Get players from cache (if fresh)
   */
  private async getCachedPlayers(page: number, perPage: number) {
    const cacheCutoff = new Date(Date.now() - this.cacheTTL);
    
    const cachedPlayers = await Player.find({
      dataSource: 'sportsdata',
      lastUpdated: { $gte: cacheCutoff }
    })
    .sort({ lastName: 1 })
    .skip(page * perPage)
    .limit(perPage);

    if (cachedPlayers.length > 0) {
      // Transform back to API format
      const transformed = cachedPlayers.map(player => ({
        id: player.playerId,
        first_name: player.firstName,
        last_name: player.lastName,
        position: player.position,
        height_feet: parseInt(player.height?.split("'")[0] || '0'),
        height_inches: parseInt(player.height?.split("'")[1]?.replace('"', '') || '0'),
        weight_pounds: player.weight,
        team: {
          id: 0, // Would need team mapping
          abbreviation: player.team.split(' ').pop() || '',
          full_name: player.team,
          name: player.team.split(' ').pop() || ''
        }
      }));

      return {
        data: transformed,
        meta: {
          total_pages: Math.ceil(await Player.countDocuments({ dataSource: 'sportsdata' }) / perPage),
          current_page: page,
          next_page: page < Math.ceil(await Player.countDocuments({ dataSource: 'sportsdata' }) / perPage) - 1 ? page + 1 : null,
          per_page: perPage,
          total_count: await Player.countDocuments({ dataSource: 'sportsdata' })
        }
      };
    }

    return null;
  }

  /**
   * Cache players from API
   */
  private async cachePlayers(apiPlayers: any[]) {
    for (const apiPlayer of apiPlayers) {
      await Player.findOneAndUpdate(
        { playerId: apiPlayer.id },
        {
          playerId: apiPlayer.id,
          firstName: apiPlayer.first_name,
          lastName: apiPlayer.last_name,
          position: apiPlayer.position,
          team: apiPlayer.team.full_name,
          height: `${apiPlayer.height_feet}'${apiPlayer.height_inches}"`,
          weight: apiPlayer.weight_pounds,
          dataSource: 'sportsdata',
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
    }
    console.log(`💾 Cached ${apiPlayers.length} players from SportsData API`);
  }

  /**
   * Force refresh of all player data
   */
  async refreshAllPlayers() {
    console.log('🔄 Force refreshing all player data from API');
    return this.getPlayers(0, 100, true);
  }

  /**
   * Check if cache needs refresh
   */
  async needsRefresh(): Promise<boolean> {
    const latestUpdate = await Player.findOne({ dataSource: 'sportsdata' })
      .sort({ lastUpdated: -1 });
    
    if (!latestUpdate) return true;
    
    return Date.now() - latestUpdate.lastUpdated.getTime() > this.cacheTTL;
  }

  // ========== DEVELOPMENT DATA ==========

  private getDevelopmentPlayers(page: number, perPage: number) {
    const developmentPlayers = [
      {
        id: 20000679, // Example SportsData.io ID for LeBron
        first_name: 'LeBron',
        last_name: 'James',
        position: 'F',
        height_feet: 6,
        height_inches: 8,
        weight_pounds: 250,
        team: {
          id: 14,
          abbreviation: 'LAL',
          city: 'Los Angeles',
          full_name: 'Los Angeles Lakers',
          name: 'Lakers'
        }
      },
      {
        id: 20000507, // Example SportsData.io ID for Curry
        first_name: 'Stephen',
        last_name: 'Curry',
        position: 'G',
        height_feet: 6,
        height_inches: 2,
        weight_pounds: 185,
        team: {
          id: 10,
          abbreviation: 'GSW',
          city: 'Golden State',
          full_name: 'Golden State Warriors',
          name: 'Warriors'
        }
      }
    ];

    const start = page * perPage;
    const end = start + perPage;
    const paginatedPlayers = developmentPlayers.slice(start, end);

    return {
      data: paginatedPlayers,
      meta: {
        total_pages: Math.ceil(developmentPlayers.length / perPage),
        current_page: page,
        next_page: page < Math.ceil(developmentPlayers.length / perPage) - 1 ? page + 1 : null,
        per_page: perPage,
        total_count: developmentPlayers.length
      }
    };
  }

  private getDevelopmentPlayerStats(params: any) {
    // ... keep your existing mock stats
  }

  private getDevelopmentPlayer(playerId: number) {
    // ... keep your existing mock player
  }

  private getDevelopmentTeams() {
    // ... keep your existing mock teams
  }

  private getTeamCity(abbreviation: string): string {
    const teamMap: { [key: string]: string } = {
      'LAL': 'Los Angeles', 'GSW': 'Golden State', 'BOS': 'Boston',
      'PHX': 'Phoenix', 'MIL': 'Milwaukee', 'CHI': 'Chicago',
      'MIA': 'Miami', 'DEN': 'Denver', 'DAL': 'Dallas',
      'PHI': 'Philadelphia', 'BKN': 'Brooklyn', 'ATL': 'Atlanta'
    };
    return teamMap[abbreviation] || abbreviation;
  }
  /**
 * Helper to get all dates in a range
 */
private getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    const safeDate = current.toISOString().split('T')[0] || '';
    dates.push(safeDate);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

  /**
 * Debug method to check available game dates
 */
    async debugAvailableDates() {
    if (!this.apiKey) {
        throw new Error('API key required');
    }

    // Test different dates to see what has data
    const testDates = [
        '2025-10-21', // Season start
        '2025-10-28', 
        '2025-11-04',
        '2025-11-11',
        '2025-11-18',
        '2025-11-25'
    ];

    const results = [];

    for (const date of testDates) {
        try {
        const response = await axios.get(
            `${this.baseURL}/stats/json/PlayerGameStatsByDate/${date}`, 
            {
            params: { key: this.apiKey },
            timeout: 5000
            }
        );
        
        results.push({
            date,
            status: response.status,
            gameCount: response.data.length,
            hasLeBron: response.data.some((g: any) => g.PlayerID === 20000571)
        });
        } catch (error: any) {
        results.push({
            date,
            error: error.message,
            status: error.response?.status
        });
        }
    }

    return results;
    }
}

export const nbaApiService = new NBAApiService();