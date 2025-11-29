/**
 * Game Socket Handlers
 * Handles real-time Socket.IO events for live game updates
 * @module sockets/gameSocket
 */

import { Socket } from 'socket.io';
import Game from '../models/Game.model';

/**
 * @desc    Interface for Socket with additional user properties
 * @interface
 */
interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

/**
 * @desc    Handle all game-related socket events
 * @param   {AuthenticatedSocket} socket - The socket instance
 * @param   {any} io - Socket.IO server instance (passed from socketManager)
 * @returns {void}
 */
export const handleGameSocketEvents = (socket: AuthenticatedSocket, io: any): void => {
  console.log(`🔌 User connected to game events: ${socket.id}`);

  /**
   * @event   join-game
   * @desc    Join a specific game room for real-time updates
   * @param   {string} gameId - The ID of the game to join
   */
  socket.on('join-game', async (gameId: string) => {
    try {
      // Validate that the game exists
      const game = await Game.findById(gameId);
      
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Leave any previous game rooms
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room.startsWith('game-') && room !== socket.id) {
          socket.leave(room);
        }
      });

      // Join the new game room
      socket.join(`game-${gameId}`);
      
      console.log(`🎮 User ${socket.id} joined game room: ${gameId}`);
      
      // Send current game state to the joining user
      socket.emit('game-joined', {
        gameId,
        game: game,
        message: `Now watching game ${gameId}`
      });

      // Notify other users in the room (optional)
      socket.to(`game-${gameId}`).emit('user-joined', {
        userId: socket.id,
        message: 'A new viewer joined the game'
      });

    } catch (error) {
      console.error('Join game socket error:', error);
      socket.emit('error', { message: 'Failed to join game' });
    }
  });

  /**
   * @event   leave-game
   * @desc    Leave a specific game room
   * @param   {string} gameId - The ID of the game to leave
   */
  socket.on('leave-game', (gameId: string) => {
    socket.leave(`game-${gameId}`);
    console.log(`🚪 User ${socket.id} left game room: ${gameId}`);
    
    socket.emit('game-left', { gameId });
  });

  /**
   * @event   game-action
   * @desc    Handle game actions from clients (for simulation control)
   * @param   {Object} data - Action data
   * @param   {string} data.gameId - Game ID
   * @param   {string} data.actionType - Type of action
   * @param   {any} data.payload - Action payload
   */
  socket.on('game-action', async (data: { gameId: string; actionType: string; payload: any }) => {
    try {
      const { gameId, actionType, payload } = data;
      
      // Verify user is in the game room
      if (!socket.rooms.has(`game-${gameId}`)) {
        socket.emit('error', { message: 'Not in game room' });
        return;
      }

      const game = await Game.findById(gameId);
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Handle different action types
      switch (actionType) {
        case 'simulate-event':
          // Use the io instance passed as parameter
          io.to(`game-${gameId}`).emit('simulation-event', {
            type: 'manual-simulation',
            payload: payload,
            timestamp: new Date().toISOString()
          });
          break;

        case 'request-stats':
          // Send detailed game statistics
          socket.emit('game-stats', {
            gameId,
            stats: calculateGameStats(game)
          });
          break;

        default:
          socket.emit('error', { message: 'Unknown action type' });
      }

    } catch (error) {
      console.error('Game action socket error:', error);
      socket.emit('error', { message: 'Game action failed' });
    }
  });

  /**
   * @event   send-message
   * @desc    Handle live game chat messages
   * @param   {Object} data - Message data
   * @param   {string} data.gameId - Game ID
   * @param   {string} data.message - Chat message
   * @param   {string} data.username - User's display name
   */
  socket.on('send-message', (data: { gameId: string; message: string; username: string }) => {
    const { gameId, message, username } = data;
    
    // Broadcast message to all users in the game room except sender
    socket.to(`game-${gameId}`).emit('new-message', {
      username,
      message,
      timestamp: new Date().toISOString(),
      userId: socket.id
    });
  });

  /**
   * @event   disconnect
   * @desc    Handle socket disconnection
   */
  socket.on('disconnect', (reason: string) => {
    console.log(`🔌 User disconnected: ${socket.id} - Reason: ${reason}`);
    
    // You could notify game rooms that user left
    socket.rooms.forEach(room => {
      if (room.startsWith('game-')) {
        socket.to(room).emit('user-left', {
          userId: socket.id,
          message: 'A viewer left the game'
        });
      }
    });
  });

  /**
   * @event   error
   * @desc    Handle socket errors
   */
  socket.on('error', (error: Error) => {
    console.error(`❌ Socket error for user ${socket.id}:`, error);
  });
};

/**
 * @desc    Calculate real-time game statistics
 * @param   {any} game - Game object
 * @returns {Object} Game statistics
 */
const calculateGameStats = (game: any): object => {
  // This would contain real statistical calculations
  // For now, return basic info
  return {
    leadChanges: 0, // You'd calculate this from game history
    ties: 0,
    largestLead: 0,
    timeOfPossession: {
      home: '12:00',
      away: '12:00'
    }
  };
};

/**
 * @desc    Emit game update to all users in a game room
 * @param   {any} io - Socket.IO server instance
 * @param   {string} gameId - Game ID
 * @param   {Object} updateData - Game update data
 */
export const emitGameUpdate = (io: any, gameId: string, updateData: any): void => {
  io.to(`game-${gameId}`).emit('game-update', {
    ...updateData,
    timestamp: new Date().toISOString()
  });
};

/**
 * @desc    Emit a highlight to all users in a game room
 * @param   {any} io - Socket.IO server instance
 * @param   {string} gameId - Game ID
 * @param   {Object} highlight - Highlight data
 */
export const emitGameHighlight = (io: any, gameId: string, highlight: any): void => {
  io.to(`game-${gameId}`).emit('game-highlight', {
    type: 'play-highlight',
    highlight: highlight,
    timestamp: new Date().toISOString()
  });
};