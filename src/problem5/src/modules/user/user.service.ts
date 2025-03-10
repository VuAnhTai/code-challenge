import User from './user.model';
import { IUser, IUserResponse } from './user.types';
import { AppError } from '../core/middleware/error.middleware';
import authService from './auth.service';

export class UserService {
  // Register new user
  async register(userData: Partial<IUser>): Promise<IUserResponse> {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    // Create new user
    const user = await User.create({
      email: userData.email!,
      name: userData.name!,
      password: userData.password!,
      role: userData.role || 'user',
      active: true,
    });

    return this.sanitizeUser(user);
  }

  // Login user
  async login(email: string, password: string): Promise<{ user: IUserResponse; token: string }> {
    // Find user by email
    const user = await User.findOne({ where: { email, active: true } });
    if (!user || !(await user.correctPassword(password))) {
      throw new AppError('Incorrect email or password', 401);
    }

    // Generate JWT token
    const token = authService.signToken(user.id, user.role);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  // Get user by ID
  async getUserById(id: number): Promise<IUserResponse> {
    const user = await User.findByPk(id);
    if (!user || !user.active) {
      throw new AppError('User not found', 404);
    }

    return this.sanitizeUser(user);
  }

  // Generate API key for user
  async generateApiKey(userId: number): Promise<string> {
    const user = await User.findByPk(userId);
    if (!user || !user.active) {
      throw new AppError('User not found', 404);
    }

    // Create API key
    const apiKey = user.createApiKey();
    await user.save();

    return apiKey;
  }

  // Validate API key
  async validateApiKey(apiKey: string): Promise<IUserResponse> {
    const hashedApiKey = authService.validateApiKey(apiKey);

    const user = await User.findOne({
      where: {
        apiKey: hashedApiKey,
        active: true,
      },
    });

    if (!user || !user.apiKeyExpires || user.apiKeyExpires < new Date()) {
      throw new AppError('Invalid or expired API key', 401);
    }

    return this.sanitizeUser(user);
  }

  // Remove password and sensitive info from user object
  private sanitizeUser(user: User): IUserResponse {
    const { id, email, name, role, apiKey, apiKeyExpires, createdAt, updatedAt } = user;
    return { id, email, name, role, apiKey, apiKeyExpires, createdAt, updatedAt };
  }
}

export default new UserService();
