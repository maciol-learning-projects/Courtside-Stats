/**
 * Game Routes
 * Defines all REST API endpoints for game operations and real-time features
 * @module routes/gameRoutes
 */

import express from 'express';
import {
  getGames,
  getGameById,
  createGame,
  updateGameScore,
  simulateGameEvent
} from '../controllers/gameController';

const router = express.Router();

/**
 * @route   GET /api/games
 * @desc    Get paginated list of games with filtering options
 * @access  Public
 * @query   {string} [status] - Filter by game status (scheduled/live/final)
 * @query   {string} [date] - Filter by specific date (YYYY-MM-DD)
 * @query   {string} [teamId] - Filter by team ID (shows games where team is home or away)
 * @query   {number} [page=1] - Page number for pagination
 * @query   {number} [limit=10] - Number of games per page
 */
router.get('/', getGames);

/**
 * @route   GET /api/games/:id
 * @desc    Get detailed information for a specific game
 * @access  Public
 * @param   {string} id - Game's MongoDB ObjectId
 */
router.get('/:id', getGameById);

/**
 * @route   POST /api/games
 * @desc    Create a new game for simulation
 * @access  Public (TODO: Add admin authentication)
 * @body    {Object} gameData - Game information following IGame interface
 */
router.post('/', createGame);

/**
 * @route   PUT /api/games/:id/score
 * @desc    Update game score and status (for live updates)
 * @access  Public (TODO: Add authentication)
 * @param   {string} id - Game's MongoDB ObjectId
 * @body    {Object} updateData - Score and status updates
 * @body    {number} [updateData.homeScore] - New home team score
 * @body    {number} [updateData.awayScore] - New away team score
 * @body    {number} [updateData.quarter] - Current quarter
 * @body    {string} [updateData.timeRemaining] - Time remaining in quarter
 * @body    {string} [updateData.status] - Game status
 * @body    {Object} [updateData.highlight] - New game highlight to add
 */
router.put('/:id/score', updateGameScore);

/**
 * @route   POST /api/games/:id/simulate
 * @desc    Simulate a random game event (for demo purposes)
 * @access  Public (TODO: Add admin authentication)
 * @param   {string} id - Game's MongoDB ObjectId
 * @returns {Object} Simulated event data and updated game state
 */
router.post('/:id/simulate', simulateGameEvent);

export default router;