/**
 * CORS Middleware
 * Handles Cross-Origin Resource Sharing configuration
 * @module middleware/corsMiddleware
 */

import { Request, Response, NextFunction } from 'express';

/**
 * @desc    CORS configuration for Courtside Stats API
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];
  
  const origin = req.headers.origin as string;
  
  console.log(`🌐 CORS Request - Origin: ${origin}, Method: ${req.method}`);
   // ALLOW REQUESTS WITH NO ORIGIN (curl, postman, etc.)
  if (!origin) {
    res.header('Access-Control-Allow-Origin', '*'); // Allow any origin for no-origin requests
    console.log(`✅ CORS Allowed for no-origin request`);
  }
  
  // Allow requests from any allowed origin
  else if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log(`✅ CORS Allowed for: ${origin}`);
  }
  // In development, allow any localhost origin for flexibility
  else if (process.env.NODE_ENV === 'development' && origin && origin.includes('localhost')) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log(`✅ CORS Allowed for development: ${origin}`);
  } else {
    console.log(`❌ CORS Blocked for: ${origin}`);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Auth-Token');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'X-Total-Count, X-Page-Count');
  res.header('Vary', 'Origin');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`🛬 Preflight request handled for: ${origin}`);
    res.sendStatus(200);
    return;
  }
  
  next();
};