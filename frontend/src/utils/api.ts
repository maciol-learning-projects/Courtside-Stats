/**
 * API Service Layer with Axios (Simplified)
 * Handles all HTTP requests to the backend API
 * @module utils/api
 */

import axios from 'axios';


const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log('All env vars:', import.meta.env);
console.log('API Base URL:', API_BASE_URL);
// Define the response structure from our API
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

/**
 * @desc    Create axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * @desc    Generic API request function (simplified)
 */
const apiRequest = async <T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient({
      method,
      url: endpoint,
      data: method !== 'GET' ? data : undefined,
      params: method === 'GET' ? data : undefined,
    });

    const apiResponse = response.data as ApiResponse<T>;

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'API request failed');
    }

    return apiResponse;
  } catch (error: any) {
    if (error.response) {
      const apiError = error.response.data as ApiResponse;
      throw new Error(apiError.message || `Server Error: ${error.response.status}`);
    } else if (error.request) {
      throw new Error('Network error - please check your connection');
    } else {
      throw new Error(error.message);
    }
  }
};

// NBA Data API services
export const nbaAPI = {
  // Visualizations
  getPlayerVisualization: (playerId: string, params?: any) =>
    apiClient.get(`/visualizations/player/${playerId}`, { params }).then(res => res.data),

  comparePlayers: (playerIds: string[], season?: number) =>
    apiClient.get('/visualizations/players/comparison', { 
      params: { playerIds: playerIds.join(','), season } 
    }).then(res => res.data),

  getTeams: () =>
    apiClient.get('/visualizations/teams').then(res => res.data),

  // Players
  getPlayers: (params?: { page?: number; perPage?: number; search?: string }) =>
    apiClient.get('/players', { params }).then(res => res.data),
  getPlayer: (id: number) =>
    apiClient.get(`/players/${id}`).then(res => res.data),
};

// Error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Network error occurred';
    console.error('API Error:', message);
    throw new Error(message);
  }
);

/**
 * @desc    Player-related API calls
 */
export const playerAPI = {
  /**
   * @desc    Get all players with optional filtering
   */
  getPlayers: (filters?: {
    team?: string;
    position?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => apiRequest('GET', '/players', filters),

  /**
   * @desc    Get single player by ID
   */
  getPlayerById: (id: string) => apiRequest('GET', `/players/${id}`),

  /**
   * @desc    Get player statistics
   */
  getPlayerStats: (id: string) => apiRequest('GET', `/players/${id}/stats`),

  /**
   * @desc    Create a new player
   */
  createPlayer: (playerData: any) => apiRequest('POST', '/players', playerData),

  /**
   * @desc    Update a player
   */
  updatePlayer: (id: string, playerData: any) =>
    apiRequest('PUT', `/players/${id}`, playerData),

  /**
   * @desc    Delete a player
   */
  deletePlayer: (id: string) => apiRequest('DELETE', `/players/${id}`),
};

/**
 * @desc    Team-related API calls
 */
export const teamAPI = {
  /**
   * @desc    Get all teams with optional filtering
   */
  getTeams: (filters?: {
    conference?: string;
    division?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => apiRequest('GET', '/teams', filters),

  /**
   * @desc    Get single team by ID
   */
  getTeamById: (id: string) => apiRequest('GET', `/teams/${id}`),

  /**
   * @desc    Get team statistics
   */
  getTeamStats: (id: string) => apiRequest('GET', `/teams/${id}/stats`),

  /**
   * @desc    Create a new team
   */
  createTeam: (teamData: any) => apiRequest('POST', '/teams', teamData),

  /**
   * @desc    Update a team
   */
  updateTeam: (id: string, teamData: any) =>
    apiRequest('PUT', `/teams/${id}`, teamData),
};

/**
 * @desc    Game-related API calls
 */
export const gameAPI = {
  /**
   * @desc    Get all games with optional filtering
   */
  getGames: (filters?: {
    status?: string;
    date?: string;
    teamId?: string;
    page?: number;
    limit?: number;
  }) => apiRequest('GET', '/games', filters),

  /**
   * @desc    Get single game by ID
   */
  getGameById: (id: string) => apiRequest('GET', `/games/${id}`),

  /**
   * @desc    Create a new game
   */
  createGame: (gameData: any) => apiRequest('POST', '/games', gameData),

  /**
   * @desc    Update game score
   */
  updateGameScore: (id: string, updateData: any) =>
    apiRequest('PUT', `/games/${id}/score`, updateData),

  /**
   * @desc    Simulate a game event
   */
  simulateGameEvent: (id: string) =>
    apiRequest('POST', `/games/${id}/simulate`),
};

/**
 * @desc    Health check API call
 */
export const healthCheck = () => apiRequest('GET', '/health');

export default apiRequest;