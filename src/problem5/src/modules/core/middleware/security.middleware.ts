import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Express } from 'express';

export const setupSecurity = (app: Express) => {
  // Set security HTTP headers
  app.use(helmet());
  
  // Rate limiting
  const limiter = rateLimit({
    max: 100, // limit each IP to 100 requests per windowMs
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests from this IP, please try again in an hour!'
  });
  
  app.use('/api', limiter);
}; 