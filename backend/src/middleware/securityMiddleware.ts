/**
 * Security Middleware
 * Handles security-related headers and protections
 * @module middleware/securityMiddleware
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

/**
 * @desc    Security headers middleware using Helmet
 */
export const securityHeaders = helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
});

/**
 * @desc    Rate limiting middleware for API protection
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @desc    Development-specific rate limiting (more lenient)
 */
export const devApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000, // Higher limit for development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @desc    Request logging middleware (simple version)
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
};