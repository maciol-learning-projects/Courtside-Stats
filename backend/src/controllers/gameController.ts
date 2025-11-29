/**
 * Game Controller
 * Handles all business logic for game operations, including real-time updates
 * @module controllers/gameController
 */

import { Request, Response } from 'express';
import Game, { IGame } from '../models/Game.model';
import Team from '../models/Team.model';
import Player from '../models/Player.model';
import { Types } from 'mongoose';

/**
 * @desc    Get all games with optional filtering by date, status, or team
 * @route   GET /api/games
 * @access  Public
 * @param   {Request} req - Express request object
 * @param   {Response} res - Express response object
 * @returns {Promise<void>} JSON response with games data
 */
export const getGames = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract query parameters for filtering
    const { 
      status, 
      date, 
      teamId, 
      page = 1, 
      limit = 10 
    } = req.query;

    // Build filter object based on query parameters
    const filter: any = {};
    if (status) filter.status = status;
    if (date) {
      // Filter by specific date (YYYY-MM-DD format)
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      filter.date = {
        $gte: startDate,
        $lt: endDate
      };
    }
    if (teamId) {
      // Find games where either homeTeam or awayTeam matches
      filter.$or = [
        { homeTeam: teamId },
        { awayTeam: teamId }
      ];
    }

    // Calculate pagination values
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query with population of team references
    const games = await Game.find(filter)
      .populate('homeTeam', 'name city abbreviation colors')
      .populate('awayTeam', 'name city abbreviation colors')
      .populate('highlights.player', 'firstName lastName position')
      .skip(skip)
      .limit(Number(limit))
      .sort({ date: -1 }); // Sort by most recent games first

    // Get total count for pagination metadata
    const total = await Game.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: games.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: games
    });

  } catch (error) {
    console.error('Get games controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching games'
    });
  }
};

/**
 * @desc    Get single game by ID with full details
 * @route   GET /api/games/:id
 * @access  Public
 * @param   {Request} req - Express request object
 * @param   {Response} res - Express response object
 * @returns {Promise<void>} JSON response with game data
 */
export const getGameById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Find game and populate all related data
    const game = await Game.findById(id)
      .populate('homeTeam')
      .populate('awayTeam')
      .populate('highlights.player', 'firstName lastName position team');

    if (!game) {
      res.status(404).json({
        success: false,
        message: `Game not found with ID: ${id}`
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: game
    });

  } catch (error) {
    console.error('Get game by ID controller error:', error);
    
    if (error instanceof Error && error.name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid game ID format'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching game'
    });
  }
};

/**
 * @desc    Create a new game (for simulating live games)
 * @route   POST /api/games
 * @access  Public (TODO: Add admin authentication)
 * @param   {Request} req - Express request object
 * @param   {Response} res - Express response object
 * @returns {Promise<void>} JSON response with created game data
 */
export const createGame = async (req: Request, res: Response): Promise<void> => {
  try {
    // Generate unique game ID
    const gameId = `G${Date.now()}`;
    
    // Validate required fields
    const { homeTeam, awayTeam, date } = req.body;
    
    if (!homeTeam || !awayTeam || !date) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: homeTeam, awayTeam, and date are required'
      });
      return;
    }

    const gameData = {
      ...req.body,
      gameId,
      status: 'scheduled' as const, // Type assertion for better TypeScript support
      scores: {
        home: 0,
        away: 0,
        quarterBreakdown: {
          q1: { home: 0, away: 0 },
          q2: { home: 0, away: 0 },
          q3: { home: 0, away: 0 },
          q4: { home: 0, away: 0 }
        }
      },
      quarter: 1,
      timeRemaining: '12:00',
      highlights: []
    };

    const game = await Game.create(gameData);

    // Populate the created game with team data for response
    await game.populate('homeTeam', 'name city abbreviation colors');
    await game.populate('awayTeam', 'name city abbreviation colors');

    res.status(201).json({
      success: true,
      message: 'Game created successfully',
      data: game
    });

  } catch (error) {
    console.error('Create game controller error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Invalid game data provided',
        errors: (error as any).errors
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating game'
    });
  }
};

/**
 * @desc    Update game score and status (for live game simulation)
 * @route   PUT /api/games/:id/score
 * @access  Public (TODO: Add authentication)
 * @param   {Request} req - Express request object
 * @param   {Response} res - Express response object
 * @returns {Promise<void>} JSON response with updated game data
 */
export const updateGameScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { 
      homeScore, 
      awayScore, 
      quarter, 
      timeRemaining, 
      status,
      highlight 
    } = req.body;

    // Prepare update object with only provided fields
    const updateData: any = {};
    if (homeScore !== undefined) updateData['scores.home'] = homeScore;
    if (awayScore !== undefined) updateData['scores.away'] = awayScore;
    if (quarter !== undefined) updateData.quarter = quarter;
    if (timeRemaining !== undefined) updateData.timeRemaining = timeRemaining;
    if (status !== undefined) updateData.status = status;

    // Add highlight to highlights array if provided
    if (highlight) {
      updateData.$push = { highlights: highlight };
    }

    const game = await Game.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('homeTeam', 'name city abbreviation colors')
    .populate('awayTeam', 'name city abbreviation colors')
    .populate('highlights.player', 'firstName lastName position');

    if (!game) {
      res.status(404).json({
        success: false,
        message: `Game not found with ID: ${id}`
      });
      return;
    }

    // Emit real-time update via Socket.IO - FIXED: Use req.app.get('io')
    const io = req.app.get('io');
    if (io) {
      io.to(`game-${id}`).emit('game-update', {
        type: 'score-update',
        game: game
      });

      // Emit specific highlight if provided
      if (highlight) {
        io.to(`game-${id}`).emit('game-highlight', {
          type: 'new-highlight',
          highlight: highlight
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Game score updated successfully',
      data: game
    });

  } catch (error) {
    console.error('Update game score controller error:', error);
    
    if (error instanceof Error && error.name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid game ID format'
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
 * @desc    Simulate a game event (shot, foul, turnover, etc.)
 * @route   POST /api/games/:id/simulate
 * @access  Public (TODO: Add admin authentication)
 * @param   {Request} req - Express request object
 * @param   {Response} res - Express response object
 * @returns {Promise<void>} JSON response with simulation result
 */
export const simulateGameEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const game = await Game.findById(id)
      .populate('homeTeam')
      .populate('awayTeam');

    if (!game) {
      res.status(404).json({
        success: false,
        message: `Game not found with ID: ${id}`
      });
      return;
    }

    // Simple game simulation logic
    const eventTypes = ['2pt-made', '2pt-miss', '3pt-made', '3pt-miss', 'foul', 'turnover'];
    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    if (!randomEvent) {
        res.status(500).json({
        success: false,
        message: 'Unexpected error: Could not select a random Event'
        });
        return;
    }
    
    // Get random player from either team - FIX: Handle empty players array
    const players = await Player.find().limit(10);
    
    // Check if players array is empty
    if (players.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No players found in database. Please add players first.'
      });
      return;
    }

    //randomPlayer is now guaranteed to be defined
    const randomIndex = Math.floor(Math.random() * players.length);
    const randomPlayer = players[randomIndex];

    if (!randomPlayer) {
        res.status(500).json({
        success: false,
        message: 'Unexpected error: Could not select a random player'
        });
        return;
    }

    // Determine which team scored based on random event
    const isHomeTeam = Math.random() > 0.5;
    
    // Create highlight based on event type - FIX: Use randomPlayer safely
    const highlight = {
      time: game.timeRemaining,
      quarter: game.quarter,
      description: `${randomPlayer.firstName} ${randomPlayer.lastName} ${getEventDescription(randomEvent)}`,
      player: randomPlayer._id,
      type: 'score' as const
    };

    // Update scores based on event
    let homeScoreUpdate = game.scores.home;
    let awayScoreUpdate = game.scores.away;

    if (randomEvent === '2pt-made') {
      isHomeTeam ? homeScoreUpdate += 2 : awayScoreUpdate += 2;
    } else if (randomEvent === '3pt-made') {
      isHomeTeam ? homeScoreUpdate += 3 : awayScoreUpdate += 3;
    }

    // Update the game with new scores and highlight
    const updatedGame = await Game.findByIdAndUpdate(
      id,
      {
        $set: {
          'scores.home': homeScoreUpdate,
          'scores.away': awayScoreUpdate
        },
        $push: { highlights: highlight }
      },
      { new: true, runValidators: true }
    )
    .populate('homeTeam', 'name city abbreviation colors')
    .populate('awayTeam', 'name city abbreviation colors')
    .populate('highlights.player', 'firstName lastName position');

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io && updatedGame) {
      io.to(`game-${id}`).emit('game-update', {
        type: 'simulation-event',
        game: updatedGame,
        event: randomEvent,
        highlight: highlight
      });
    }

    res.status(200).json({
      success: true,
      message: 'Game event simulated successfully',
      data: {
        event: randomEvent,
        highlight: highlight,
        game: updatedGame
      }
    });

  } catch (error) {
    console.error('Simulate game event controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while simulating game event'
    });
  }
};

/**
 * @desc    Helper function to generate event descriptions
 * @param   {string} eventType - Type of basketball event
 * @returns {string} Human-readable event description
 */
const getEventDescription = (eventType: string): string => {
  const descriptions: { [key: string]: string } = {
    '2pt-made': 'makes a 2-point shot',
    '2pt-miss': 'misses a 2-point shot',
    '3pt-made': 'makes a 3-pointer',
    '3pt-miss': 'misses a 3-pointer',
    'foul': 'commits a foul',
    'turnover': 'turns over the ball'
  };
  
  return descriptions[eventType] || 'makes a play';
};