/**
 * Socket.IO Connection Manager
 * Centralized management of Socket.IO connections and namespaces
 * @module sockets/socketManager
 */

import { Server as SocketIOServer } from 'socket.io';
import { handleGameSocketEvents } from './gameSocket';

/**
 * @desc    Initialize and configure Socket.IO server
 * @param   {SocketIOServer} io - Socket.IO server instance
 * @returns {void}
 */
export const initializeSocketIO = (io: SocketIOServer): void => {
  console.log('🔌 Initializing Socket.IO server...');

  // Middleware for authentication (simplified for now)
  io.use((socket, next) => {
    // TODO: Implement proper authentication
    // For now, just allow all connections
    const token = socket.handshake.auth.token;
    
    if (token) {
      // In real app, verify JWT token here
      (socket as any).userId = 'user-' + Math.random().toString(36).substr(2, 9);
      (socket as any).username = 'User-' + Math.random().toString(36).substr(2, 5);
    } else {
      // Allow anonymous connections for demo
      (socket as any).userId = 'anonymous-' + socket.id;
      (socket as any).username = 'Anonymous';
    }
    
    next();
  });

  // Handle connection event
  io.on('connection', (socket) => {
    console.log(`✅ New socket connection: ${socket.id}`);
    console.log(`   User: ${(socket as any).username}`);
    console.log(`   Total connections: ${io.engine.clientsCount}`);

    // Initialize game-specific socket handlers - PASS io instance
    handleGameSocketEvents(socket, io);

    // Send welcome message to client
    socket.emit('welcome', {
      message: 'Connected to Courtside Stats real-time server',
      socketId: socket.id,
      userId: (socket as any).userId,
      serverTime: new Date().toISOString()
    });

    // Handle connection health checks
    socket.on('ping', (data: any) => {
      socket.emit('pong', {
        ...data,
        serverTime: new Date().toISOString()
      });
    });

    // Handle client disconnection
    socket.on('disconnect', (reason: string) => {
      console.log(`🔌 Socket disconnected: ${socket.id} - Reason: ${reason}`);
      console.log(`   Remaining connections: ${io.engine.clientsCount}`);
    });
  });

  // Global error handling for Socket.IO server
  io.engine.on('connection_error', (err: any) => {
    console.error('❌ Socket.IO connection error:', err);
  });

  console.log('✅ Socket.IO server initialized successfully');
};

/**
 * @desc    Get all connected sockets in a specific game room
 * @param   {SocketIOServer} io - Socket.IO server instance
 * @param   {string} gameId - Game ID
 * @returns {number} Number of connected clients in the room
 */
export const getGameRoomClients = (io: SocketIOServer, gameId: string): number => {
  const room = io.sockets.adapter.rooms.get(`game-${gameId}`);
  return room ? room.size : 0;
};

/**
 * @desc    Broadcast system message to all connected clients
 * @param   {SocketIOServer} io - Socket.IO server instance
 * @param   {string} message - System message
 */
export const broadcastSystemMessage = (io: SocketIOServer, message: string): void => {
  io.emit('system-message', {
    type: 'info',
    message: message,
    timestamp: new Date().toISOString()
  });
};