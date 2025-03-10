import { Request, Response, NextFunction } from 'express';
import { AppError } from '../core/middleware/error.middleware';
import authService from './auth.service';
import userService from './user.service';
import User from './user.model';
import logger from '../core/utils/logger.util';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      apiUser?: User;
    }
  }
}

// Middleware to protect routes with JWT authentication
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    console.log('token', token);

    // Check if token exists
    if (!token) {
      return next(new AppError('You are not logged in. Please log in to access.', 401));
    }

    // Verify token
    const decoded = authService.verifyToken(token);

    // Check if user still exists
    const user = await User.findByPk(decoded.id);
    if (!user || !user.active) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User recently changed password. Please log in again.', 401));
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to protect routes with API key
export const protectApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get API key from header
    const apiKey = req.headers['x-api-key'] as string;

    // Check if API key exists
    if (!apiKey) {
      return next(new AppError('API key is required', 401));
    }

    // Validate API key
    try {
      const user = await userService.validateApiKey(apiKey);
      req.apiUser = user as any;
      next();
    } catch (error) {
      logger.error('API Key validation failed:', error);
      return next(new AppError('Invalid API key', 401));
    }
  } catch (error) {
    next(error);
  }
};

// Middleware to restrict access to specific roles
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Get user from request (set by protect middleware)
    const user = req.user || req.apiUser;
    if (!user) {
      return next(new AppError('You are not authorized to access this resource', 401));
    }

    // Check if user role is in allowed roles
    if (!roles.includes(user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};
