/**
 * Team Routes
 * Defines all REST API endpoints for team operations
 * @module routes/teamRoutes
 */

import express from 'express';
import {
  getTeams,
  getTeamById,
  getTeamStats,
  createTeam,
  updateTeam,
  deleteTeam
} from '../controllers/teamController';

// Initialize Express router
const router = express.Router();

/**
 * @route   GET /api/teams
 * @desc    Get paginated list of teams with optional filtering
 * @access  Public
 * @query   {string} [conference] - Filter by conference (East/West)
 * @query   {string} [division] - Filter by division
 * @query   {string} [search] - Search by team name or city
 * @query   {number} [page=1] - Page number for pagination
 * @query   {number} [limit=30] - Number of teams per page
 */
router.get('/', getTeams);

/**
 * @route   GET /api/teams/:id
 * @desc    Get detailed information for a specific team
 * @access  Public
 * @param   {string} id - Team's MongoDB ObjectId
 */
router.get('/:id', getTeamById);

/**
 * @route   GET /api/teams/:id/stats
 * @desc    Get statistics and performance metrics for a team
 * @access  Public
 * @param   {string} id - Team's MongoDB ObjectId
 */
router.get('/:id/stats', getTeamStats);

/**
 * @route   POST /api/teams
 * @desc    Create a new team (admin functionality)
 * @access  Public (TODO: Add authentication/authorization)
 * @body    {Object} teamData - Team information following ITeam interface
 */
router.post('/', createTeam);

/**
 * @route   PUT /api/teams/:id
 * @desc    Update an existing team's information
 * @access  Public (TODO: Add authentication/authorization)
 * @param   {string} id - Team's MongoDB ObjectId
 * @body    {Object} updateData - Fields to update
 */
router.put('/:id', updateTeam);

/**
 * @route   DELETE /api/teams/:id
 * @desc    Permanently delete a team from the database
 * @access  Public (TODO: Add admin authentication/authorization)
 * @param   {string} id - Team's MongoDB ObjectId
 */
router.delete('/:id', deleteTeam);

export default router;