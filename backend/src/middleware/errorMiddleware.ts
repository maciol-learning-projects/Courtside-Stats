/**
 * Error Handling Middleware
 * Centralized error handling for the entire application
 * @module middleware/errorMiddleware
 */

import { Request, Response, NextFunction } from 'express';

/**
 * @desc    Custom error class for API errors
 */
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * @desc    Global error handler middleware
 * @param   {Error} err - Error object
 * @param   {Request} req - Express request object
 * @param   {Response} res - Express response object
 * @param   {NextFunction} next - Express next function
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('🚨 Error Handler:', err);

  // Default error response
  let errorResponse = {
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Handle ApiError instances
  if (err instanceof ApiError) {
    errorResponse = {
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };
    
    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    errorResponse.message = 'Validation failed';
    res.status(400).json(errorResponse);
    return;
  }

  // Handle Mongoose duplicate key errors
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    errorResponse.message = 'Duplicate field value entered';
    res.status(400).json(errorResponse);
    return;
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    errorResponse.message = 'Resource not found';
    res.status(404).json(errorResponse);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    errorResponse.message = 'Invalid token';
    res.status(401).json(errorResponse);
    return;
  }

  // Handle JWT expired errors
  if (err.name === 'TokenExpiredError') {
    errorResponse.message = 'Token expired';
    res.status(401).json(errorResponse);
    return;
  }

  // Default to 500 server error
  res.status(500).json(errorResponse);
};

/**
 * @desc    Async error handler wrapper (eliminates try-catch blocks in controllers)
 * @param   {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @desc    404 Not Found middleware
 * @param   {Request} req - Express request object
 * @param   {Response} res - Express response object
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};