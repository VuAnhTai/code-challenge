import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.util';

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`${req.method} ${req.path} - ${err.statusCode}: ${err.message}`);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // For unhandled errors
  logger.error(`UNHANDLED ERROR: ${err.message}`, { stack: err.stack });
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl.includes('api-docs')) {
    return next();
  }

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
}; 