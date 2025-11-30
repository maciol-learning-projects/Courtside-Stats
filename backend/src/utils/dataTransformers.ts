/**
 * Transform NBA API data to our application's interface
 * This ensures our frontend works with consistent data structures
 */

// Interfaces for Ball Don't Lie API responses
export interface NBAPlayer {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  height_feet: number | null;
  height_inches: number | null;
  weight_pounds: number | null;
  team: NBATeam;
}

export interface NBATeam {
  id: number;
  abbreviation: string;
  city: string;
  conference: string;
  division: string;
  full_name: string;
  name: string;
}

export interface NBAStats {
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
  game: NBAGame;
  min: string | null;
  oreb: number | null;
  pf: number | null;
  player: NBAPlayer;
  pts: number | null;
  reb: number | null;
  stl: number | null;
  team: NBATeam;
  turnover: number | null;
}

export interface NBAGame {
  id: number;
  date: string;
  home_team_id: number;
  home_team_score: number;
  period: number;
  postseason: boolean;
  season: number;
  status: string;
  time: string;
  visitor_team_id: number;
  visitor_team_score: number;
}

// Our application interfaces
export interface AppPlayer {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  team: AppTeam;
  height: string | null;
  weight: number | null;
}

export interface AppTeam {
  id: number;
  abbreviation: string;
  city: string;
  name: string;
  fullName: string;
  conference: string;
  division: string;
}

export interface AppPlayerStats {
  gameId: number;
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  opponentTeamId: number;
  opponentTeamName: string;
  gameDate: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  minutesPlayed: string;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  fieldGoalPercentage: number;
  threePointersMade: number;
  threePointersAttempted: number;
  threePointPercentage: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  freeThrowPercentage: number;
  plusMinus: number | null;
}

export interface AppGame {
  id: number;
  date: string;
  homeTeam: AppTeam;
  awayTeam: AppTeam;
  homeScore: number;
  awayScore: number;
  status: string;
  season: number;
  postseason: boolean;
}

/**
 * Transform NBA API player data to our application format
 */
export function transformPlayer(nbaPlayer: NBAPlayer): AppPlayer {
  return {
    id: nbaPlayer.id,
    firstName: nbaPlayer.first_name,
    lastName: nbaPlayer.last_name,
    fullName: `${nbaPlayer.first_name} ${nbaPlayer.last_name}`,
    position: nbaPlayer.position || 'Unknown',
    team: transformTeam(nbaPlayer.team),
    height: nbaPlayer.height_feet && nbaPlayer.height_inches 
      ? `${nbaPlayer.height_feet}'${nbaPlayer.height_inches}"`
      : null,
    weight: nbaPlayer.weight_pounds
  };
}

/**
 * Transform NBA API team data to our application format
 */
export function transformTeam(nbaTeam: NBATeam): AppTeam {
  return {
    id: nbaTeam.id,
    abbreviation: nbaTeam.abbreviation,
    city: nbaTeam.city,
    name: nbaTeam.name,
    fullName: nbaTeam.full_name,
    conference: nbaTeam.conference,
    division: nbaTeam.division
  };
}

/**
 * Transform NBA API stats data to our application format
 */
export function transformPlayerStats(nbaStats: NBAStats): AppPlayerStats {
  const game = nbaStats.game;
  const isHomeTeam = game.home_team_id === nbaStats.team.id;
  
  return {
    gameId: game.id,
    playerId: nbaStats.player.id,
    playerName: `${nbaStats.player.first_name} ${nbaStats.player.last_name}`,
    teamId: nbaStats.team.id,
    teamName: nbaStats.team.full_name,
    opponentTeamId: isHomeTeam ? game.visitor_team_id : game.home_team_id,
    opponentTeamName: isHomeTeam ? 'Unknown' : 'Unknown', // We'll need to fetch this separately
    gameDate: game.date,
    points: nbaStats.pts || 0,
    rebounds: nbaStats.reb || 0,
    assists: nbaStats.ast || 0,
    steals: nbaStats.stl || 0,
    blocks: nbaStats.blk || 0,
    turnovers: nbaStats.turnover || 0,
    minutesPlayed: nbaStats.min || '0:00',
    fieldGoalsMade: nbaStats.fgm || 0,
    fieldGoalsAttempted: nbaStats.fga || 0,
    fieldGoalPercentage: nbaStats.fg_pct ? nbaStats.fg_pct * 100 : 0,
    threePointersMade: nbaStats.fg3m || 0,
    threePointersAttempted: nbaStats.fg3a || 0,
    threePointPercentage: nbaStats.fg3_pct ? nbaStats.fg3_pct * 100 : 0,
    freeThrowsMade: nbaStats.ftm || 0,
    freeThrowsAttempted: nbaStats.fta || 0,
    freeThrowPercentage: nbaStats.ft_pct ? nbaStats.ft_pct * 100 : 0,
    plusMinus: null // Ball Don't Lie API doesn't provide plus/minus
  };
}

/**
 * Transform NBA API game data to our application format
 */
export function transformGame(nbaGame: NBAGame, homeTeam: NBATeam, awayTeam: NBATeam): AppGame {
  return {
    id: nbaGame.id,
    date: nbaGame.date,
    homeTeam: transformTeam(homeTeam),
    awayTeam: transformTeam(awayTeam),
    homeScore: nbaGame.home_team_score,
    awayScore: nbaGame.visitor_team_score,
    status: nbaGame.status,
    season: nbaGame.season,
    postseason: nbaGame.postseason
  };
}

/**
 * Calculate player efficiency (PER-like metric)
 */
export function calculateEfficiency(stats: AppPlayerStats): number {
  const { points, rebounds, assists, steals, blocks, turnovers } = stats;
  // Simple efficiency formula: PTS + REB + AST + STL + BLK - TO
  return points + rebounds + assists + steals + blocks - turnovers;
}

/**
 * Format minutes played from "MM:SS" to decimal minutes
 */
export function formatMinutesPlayed(minutes: string): number {
  if (!minutes) return 0;
  const [mins, secs] = minutes.split(':').map(Number);
  if (!(mins) || !(secs)) return 0;
  return mins + (secs / 60);
}