import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { IDecodedToken } from './user.types';
import { AppError } from '../core/middleware/error.middleware';
import dotenv from 'dotenv';
import { StringValue } from 'ms';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export class AuthService {
  // Create JWT token
  public signToken(id: number, role: string): string {
    const payload = { id, role };
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as StringValue };

    return jwt.sign(payload, JWT_SECRET as Secret, options);
  }

  // Verify JWT token
  public verifyToken(token: string): IDecodedToken {
    try {
      const decoded = jwt.verify(token, JWT_SECRET as Secret) as IDecodedToken;
      return decoded;
    } catch (error) {
      throw new AppError('Invalid token. Please log in again.', 401);
    }
  }

  // Validate API key
  public validateApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }
}

export default new AuthService();
