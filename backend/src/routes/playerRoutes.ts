import express from 'express';
import {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getPlayerStats
} from '../controllers/playerController';

const router = express.Router();

// GET /api/players - Get all players with optional filtering
router.get('/', getPlayers);

// GET /api/players/:id - Get single player by ID
router.get('/:id', getPlayerById);

// GET /api/players/:id/stats - Get player statistics
router.get('/:id/stats', getPlayerStats);

// POST /api/players - Create new player
router.post('/', createPlayer);

// PUT /api/players/:id - Update player
router.put('/:id', updatePlayer);

// DELETE /api/players/:id - Delete player
router.delete('/:id', deletePlayer);

export default router;