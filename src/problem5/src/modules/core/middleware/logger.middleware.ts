import morgan from 'morgan';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.util';

// Create a stream object with a 'write' function
const stream = {
  write: (message: string) => logger.http(message.trim()),
};

// Skip all the Morgan http logs in production
// unless the NODE_ENV is 'development'
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env !== 'development';
};

// Morgan middleware
export const morganMiddleware = morgan(
  // Define message format
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  { stream, skip },
);

// Request ID middleware
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const id = Math.random().toString(36).substring(2, 10);
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
};

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}
