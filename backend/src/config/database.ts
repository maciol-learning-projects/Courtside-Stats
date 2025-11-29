/**
 * Database Configuration
 * Handles MongoDB connection and configuration settings
 * @module config/database
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

const getMongoDBUri = (): string => {
  // If running in Docker, use service name 'mongo'
  if (process.env.DOCKER_ENV) {
    return process.env.MONGO_URI || 'mongodb://mongo:27017/courtside-stats';
  }
  // If running locally, use localhost
  return process.env.MONGO_URI || 'mongodb://localhost:27017/courtside-stats';
};

const MONGODB_URI = getMongoDBUri();

dotenv.config();

/**
 * @desc    MongoDB connection options for optimal performance
 * @type    {mongoose.ConnectOptions}
 */
const connectionOptions: mongoose.ConnectOptions = {
  // Connection pool settings
  maxPoolSize: 10, // Maximum number of sockets in the connection pool
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  
  // Remove all deprecated options - use only supported ones
  bufferCommands: false, // Disable mongoose buffering
  
  // Additional stability options (these are supported in modern Mongoose)
  family: 4, // Use IPv4, skip trying IPv6
  autoIndex: process.env.NODE_ENV !== 'production', // Build indexes automatically in development only
};

/**
 * @desc    Establishes connection to MongoDB database
 * @returns {Promise<void>} Resolves when connection is established
 * @throws  {Error} If connection fails
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    
    await mongoose.connect(MONGODB_URI, connectionOptions);
    
    console.log('✅ MongoDB connected successfully');
    
    // FIX: Safely access database name with optional chaining and nullish coalescing
    const dbName = mongoose.connection.db?.databaseName ?? 'unknown';
    console.log(`📊 Database: ${dbName}`);
    console.log(`👥 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1); // Exit process with failure if database connection fails
  }
};

/**
 * @desc    Closes the MongoDB connection
 * @returns {Promise<void>} Resolves when connection is closed
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }
};

/**
 * @desc    Drops the entire database (for testing purposes only)
 * @returns {Promise<void>} Resolves when database is dropped
 */
export const dropDatabase = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'test') {
    try {
      // FIX: Use optional chaining to safely access the database
      if (mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase();
        console.log('✅ Test database dropped');
      } else {
        console.log('❌ No database connection available to drop');
      }
    } catch (error) {
      console.error('❌ Error dropping test database:', error);
    }
  }
};

// Export mongoose instance for use in other modules
export { mongoose };