/**
 * Team Controller
 * Handles all business logic for team-related operations
 * @module controllers/teamController
 */

import { Request, Response } from 'express';
import Team, { ITeam } from '../models/Team.model';

/**
 * @desc    Get all teams with optional filtering and pagination
 * @route   GET /api/teams
 * @access  Public
 * @param   {Request} req - Express request object
 * @param   {Response} res - Express response object
 * @returns {Promise<void>} JSON response with teams data
 */
export const getTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract query parameters for filtering and pagination
    const { conference, division, search, page = 1, limit = 30 } = req.query;
    
    // Build filter object based on provided query parameters
    const filter: any = {};
    if (conference) filter.conference = conference;
    if (division) filter.division = division;
    if (search) {
      // Case-insensitive search by team name or city
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination values
    const skip = (Number(page) - 1) * Number(limit);
    
    // Execute database query with filters and pagination
    const teams = await Team.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ name: 1 }); // Sort teams alphabetically by name

    // Get total count for pagination metadata
    const total = await Team.countDocuments(filter);

    // Return standardized success response
    res.status(200).json({
      success: true,
      count: teams.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: teams
    });
    
  } catch (error) {
    // Log error for server-side debugging
    console.error('Get teams controller error:', error);
    
    // Return standardized error response
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching teams'
    });
  }
};

/**
 * @desc    Get single team by ID with detailed information
 * @route   GET /api/teams/:id
 * @access  Public
 * @param   {Request} req - Express request object with team ID in params
 * @param   {Response} res - Express response object
 * @returns {Promise<void>} JSON response with team data or error
 */
export const getTeamById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Find team by MongoDB ID
    const team = await Team.findById(id);
    
    // Handle team not found scenario
    if (!team) {
      res.status(404).json({
        success: false,
        message: `Team not found with ID: ${id}`
      });
      return;
    }

    // Return successful response with team data
    res.status(200).json({
      success: true,
      data: team
    });
    
  } catch (error) {
    console.error('Get team by ID controller error:', error);
    
    // Handle invalid MongoDB ID format
    if (error instanceof Error && error.name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid team ID format'
      });
      return;
    }
    
    // Generic server error response
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching team'
    });
  }
};

/**
 * @desc    Get team statistics and performance metrics
 * @route   GET /api/teams/:id/stats
 * @access  Public
 * @param   {Request} req - Express request object
 * @param   {Response} res - Express response object
 * @returns {Promise<void>} JSON response with team statistics
 */
export const getTeamStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const team = await Team.findById(id);
    
    if (!team) {
      res.status(404).json({
        success: false,
        message: `Team not found with ID: ${id}`
      });
      return;
    }

    // Calculate derived statistics
    const totalGames = team.wins + team.losses;
    const winPercentage = totalGames > 0 ? (team.wins / totalGames) * 100 : 0;

    // Return comprehensive stats object
    res.status(200).json({
      success: true,
      data: {
        team: {
          name: team.name,
          city: team.city,
          abbreviation: team.abbreviation
        },
        record: {
          wins: team.wins,
          losses: team.losses,
          totalGames,
          winPercentage: Number(winPercentage.toFixed(1)) // Round to 1 decimal place
        },
        achievements: {
          championships: team.championships,
          established: team.established
        },
        venue: {
          arena: team.arena,
          coach: team.coach
        }
      }
    });
    
  } catch (error) {
    console.error('Get team stats controller error:', error);
    
    if (error instanceof Error && error.name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid team ID format'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching team statistics'
    });
  }
};

/**
 * @desc    Create a new team in the database
 * @route   POST /api/teams
 * @access  Public (TODO: Add admin authentication middleware)
 * @param   {Request} req - Express request object with team data in body
 * @param   {Response} res - Express response object
 * @returns {Promise<void>} JSON response with created team data
 */
export const createTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    // Create new team document from request body
    const team = await Team.create(req.body);
    
    // Return 201 Created status with new team data
    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: team
    });
    
  } catch (error) {
    console.error('Create team controller error:', error);
    
    // Handle duplicate team ID error
    if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
      res.status(409).json({ // 409 Conflict
        success: false,
        message: 'Team with this ID already exists'
      });
      return;
    }
    
    // Handle validation errors from Mongoose
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Invalid team data provided',
        errors: (error as any).errors
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating team'
    });
  }
};

/**
 * @desc    Update an existing team's information
 * @route   PUT /api/teams/:id
 * @access  Public (TODO: Add admin authentication middleware)
 * @param   {Request} req - Express request object
 * @param   {Response} res - Express response object
 * @returns {Promise<void>} JSON response with updated team data
 */
export const updateTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Find and update team, returning the updated document
    const team = await Team.findByIdAndUpdate(
      id,
      req.body,
      { 
        new: true,        // Return updated document
        runValidators: true, // Run model validators on update
        context: 'query'  // Required for proper validation context
      }
    );
    
    if (!team) {
      res.status(404).json({
        success: false,
        message: `Team not found with ID: ${id}`
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      data: team
    });
    
  } catch (error) {
    console.error('Update team controller error:', error);
    
    if (error instanceof Error && error.name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid team ID format'
      });
      return;
    }
    
    res.status(400).json({
      success: false,
      message: 'Invalid update data provided'
    });
  }
};

/**
 * @desc    Delete a team from the database
 * @route   DELETE /api/teams/:id
 * @access  Public (TODO: Add admin authentication middleware)
 * @param   {Request} req - Express request object
 * @param   {Response} res - Express response object
 * @returns {Promise<void>} JSON response confirming deletion
 */
export const deleteTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const team = await Team.findByIdAndDelete(id);
    
    if (!team) {
      res.status(404).json({
        success: false,
        message: `Team not found with ID: ${id}`
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully',
      data: {
        id: team._id,
        name: `${team.city} ${team.name}`
      }
    });
    
  } catch (error) {
    console.error('Delete team controller error:', error);
    
    if (error instanceof Error && error.name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid team ID format'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting team'
    });
  }
};