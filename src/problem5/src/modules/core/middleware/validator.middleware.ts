import { Request, Response, NextFunction } from 'express';
import Joi, { ObjectSchema } from 'joi';
import { AppError } from './error.middleware';

export const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      return next(new AppError(errorMessage, 400));
    }
    
    next();
  };
}; 