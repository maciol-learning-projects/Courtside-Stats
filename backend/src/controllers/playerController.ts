import { Request, Response } from 'express';
import Player, { IPlayer } from '../models/Player.model';

// @desc    Get all players
// @route   GET /api/players
// @access  Public
export const getPlayers = async (req: Request, res: Response) => {
  try {
    // Get query parameters for filtering
    const { team, position, search, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter: any = {};
    if (team) filter.team = team;
    if (position) filter.position = position;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Execute query with pagination
    const players = await Player.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ lastName: 1 });  // Sort by last name A-Z

    // Get total count for pagination info
    const total = await Player.countDocuments(filter);

    res.json({
      success: true,
      count: players.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: players
    });
  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single player by ID
// @route   GET /api/players/:id
// @access  Public
export const getPlayerById = async (req: Request, res: Response) => {
  try {
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    res.json({
      success: true,
      data: player
    });
  } catch (error) {
    console.error('Get player error:', error);
    
    // Check if it's an invalid ID format
    if (error instanceof Error && error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid player ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get player statistics
// @route   GET /api/players/:id/stats
// @access  Public
export const getPlayerStats = async (req: Request, res: Response) => {
  try {
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    res.json({
      success: true,
      data: {
        player: `${player.firstName} ${player.lastName}`,
        stats: player.stats
      }
    });
  } catch (error) {
    console.error('Get player stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create new player
// @route   POST /api/players
// @access  Public (for now - add authentication later)
export const createPlayer = async (req: Request, res: Response) => {
  try {
    const player = await Player.create(req.body);
    
    res.status(201).json({
      success: true,
      data: player
    });
  } catch (error) {
    console.error('Create player error:', error);
    
    // Handle duplicate key error
    if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Player with this ID already exists'
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Invalid player data'
    });
  }
};

// @desc    Update player
// @route   PUT /api/players/:id
// @access  Public
export const updatePlayer = async (req: Request, res: Response) => {
  try {
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }  // Return updated document and run validation
    );
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    res.json({
      success: true,
      data: player
    });
  } catch (error) {
    console.error('Update player error:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid update data'
    });
  }
};

// @desc    Delete player
// @route   DELETE /api/players/:id
// @access  Public
export const deletePlayer = async (req: Request, res: Response) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    res.json({
      success: true,
      message: 'Player deleted successfully'
    });
  } catch (error) {
    console.error('Delete player error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};