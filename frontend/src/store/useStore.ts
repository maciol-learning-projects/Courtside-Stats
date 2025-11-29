/**
 * Zustand State Management Store
 * Centralized state management for the entire application
 * @module store/useStore
 */

import { create } from 'zustand';
import { playerAPI, teamAPI, gameAPI } from '../utils/api';

// Type definitions for our state
interface Player {
  _id: string;
  firstName: string;
  lastName: string;
  position: string;
  team: string;
  stats: {
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    gamesPlayed: number;
  };
}

interface Team {
  _id: string;
  name: string;
  city: string;
  abbreviation: string;
  conference: string;
  division: string;
  colors: {
    primary: string;
    secondary: string;
  };
  wins: number;
  losses: number;
}

interface Game {
  _id: string;
  gameId: string;
  homeTeam: Team;
  awayTeam: Team;
  status: 'scheduled' | 'live' | 'final';
  scores: {
    home: number;
    away: number;
  };
  quarter: number;
  timeRemaining: string;
}

interface AppState {
  // State
  players: Player[];
  teams: Team[];
  games: Game[];
  selectedPlayer: Player | null;
  selectedTeam: Team | null;
  selectedGame: Game | null;
  loading: boolean;
  error: string | null;

  // Player Actions
  fetchPlayers: (filters?: any) => Promise<void>;
  fetchPlayerById: (id: string) => Promise<void>;
  setSelectedPlayer: (player: Player | null) => void;

  // Team Actions
  fetchTeams: (filters?: any) => Promise<void>;
  fetchTeamById: (id: string) => Promise<void>;
  setSelectedTeam: (team: Team | null) => void;

  // Game Actions
  fetchGames: (filters?: any) => Promise<void>;
  fetchGameById: (id: string) => Promise<void>;
  setSelectedGame: (game: Game | null) => void;

  // Utility Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * @desc    Main application store using Zustand
 */
export const useStore = create<AppState>((set) => ({
  // Initial State
  players: [],
  teams: [],
  games: [],
  selectedPlayer: null,
  selectedTeam: null,
  selectedGame: null,
  loading: false,
  error: null,

  // Player Actions
  fetchPlayers: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await playerAPI.getPlayers(filters);
      // TypeScript knows response.data is Player[]
      set({ players: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchPlayerById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const response = await playerAPI.getPlayerById(id);
      set({ selectedPlayer: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setSelectedPlayer: (player: Player | null) => {
    set({ selectedPlayer: player });
  },

  // Team Actions
  fetchTeams: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await teamAPI.getTeams(filters);
      set({ teams: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchTeamById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const response = await teamAPI.getTeamById(id);
      set({ selectedTeam: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setSelectedTeam: (team: Team | null) => {
    set({ selectedTeam: team });
  },

  // Game Actions
  fetchGames: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await gameAPI.getGames(filters);
      set({ games: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchGameById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const response = await gameAPI.getGameById(id);
      set({ selectedGame: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setSelectedGame: (game: Game | null) => {
    set({ selectedGame: game });
  },

  // Utility Actions
  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));