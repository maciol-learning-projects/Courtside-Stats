/**
 * Main Server File
 * Entry point for the Courtside Stats backend API
 * @module server
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { 
  corsMiddleware, 
  errorHandler, 
  notFoundHandler,
  securityHeaders,
  apiLimiter,
  devApiLimiter,
  requestLogger 
} from './middleware';

// Import route handlers
import playerRoutes from './routes/playerRoutes';
import teamRoutes from './routes/teamRoutes';
import gameRoutes from './routes/gameRoutes';

// Import environment variables
import dotenv from 'dotenv';
dotenv.config();

// Initialize Express application
const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);

const getMongoDBUri = (): string => {
  // If running in Docker, use service name 'mongo'
  if (process.env.DOCKER_ENV) {
    return process.env.MONGO_URI || 'mongodb://mongo:27017/courtside-stats';
  }
  // If running locally, use localhost
  return process.env.MONGO_URI || 'mongodb://localhost:27017/courtside-stats';
};

const MONGODB_URI = getMongoDBUri();

// Create HTTP server for Socket.IO
const httpServer = createServer(app);

// Initialize Socket.IO for real-time functionality
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware Configuration

// Security Middleware
app.use(securityHeaders);
app.use(process.env.NODE_ENV === 'production' ? apiLimiter : devApiLimiter);

// CORS Middleware
app.use(corsMiddleware);

// Request Logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes Configuration

/**
 * @route   /api/players
 * @desc    All player-related endpoints
 */
app.use('/api/players', playerRoutes);

/**
 * @route   /api/teams  
 * @desc    All team-related endpoints
 */
app.use('/api/teams', teamRoutes);

/**
 * @route   /api/games
 * @desc    All game-related endpoints
 */
app.use('/api/games', gameRoutes);

// Health Check Endpoint

/**
 * @route   GET /api/health
 * @desc    Health check endpoint for monitoring and deployment verification
 * @access  Public
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Courtside Stats API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Socket.IO Connection Handling

/**
 * @event   connection
 * @desc    Handle new Socket.IO connections for real-time features
 */
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Join game room for real-time updates
  socket.on('join-game', (gameId: string) => {
    socket.join(`game-${gameId}`);
    console.log(`User ${socket.id} joined game room: ${gameId}`);
  });
  
  // Leave game room
  socket.on('leave-game', (gameId: string) => {
    socket.leave(`game-${gameId}`);
    console.log(`User ${socket.id} left game room: ${gameId}`);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Make io available to other modules
app.set('io', io);

// Global Error Handling Middleware

/**
 * @desc    Global error handler for uncaught exceptions
 * @param   {Error} err - Error object
 * @param   {Request} req - Express request object
 * @param   {Response} res - Express response object
 * @param   {NextFunction} next - Express next function
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 Handler for Undefined Routes

// 404 Handler
app.use(notFoundHandler);

// Error Handler (must be last!)
app.use(errorHandler);

// Database Connection and Server Startup

/**
 * @desc    Connect to MongoDB and start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB with Mongoose
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');

    // Start HTTP server (not Express app directly, for Socket.IO support)
    httpServer.listen(PORT, () => {
      console.log(`🚀 Courtside Stats server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1); // Exit process with failure code
  }
};

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

// Start the server
startServer();

export default app;