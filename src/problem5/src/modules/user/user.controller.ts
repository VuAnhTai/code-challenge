import { Request, Response, NextFunction } from 'express';
import userService from './user.service';

// Register new user
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.register(req.body);
    res.status(201).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await userService.login(email, password);

    res.status(200).json({
      status: 'success',
      token,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // User is attached to request by protect middleware
    res.status(200).json({
      status: 'success',
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// Generate API key for user
export const generateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // User must be logged in
    if (!req.user) {
      return next(new Error('User not authenticated'));
    }

    const apiKey = await userService.generateApiKey(req.user.id);
    const expiresAt = req.user.apiKeyExpires;

    res.status(200).json({
      status: 'success',
      apiKey,
      expiresAt,
    });
  } catch (error) {
    next(error);
  }
};
