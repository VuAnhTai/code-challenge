import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../core/config/db.config';
import { IUser } from './user.types';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Interface for User creation attributes
interface UserCreationAttributes extends Optional<IUser, 'id'> {}

class User extends Model<IUser, UserCreationAttributes> implements IUser {
  public id!: number;
  public email!: string;
  public name!: string;
  public password!: string;
  public role!: 'user' | 'admin';
  public apiKey?: string;
  public apiKeyExpires?: Date;
  public active!: boolean;
  public passwordChangedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Check if password is correct
  public async correctPassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Check if user changed password after token was issued
  public changedPasswordAfter(JWTTimestamp: number): boolean {
    if (this.passwordChangedAt) {
      const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
      return JWTTimestamp < changedTimestamp;
    }
    return false;
  }

  // Generate API key
  public createApiKey(): string {
    const apiKey = crypto.randomBytes(32).toString('hex');
    this.apiKey = crypto.createHash('sha256').update(apiKey).digest('hex');
    this.apiKeyExpires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
    return apiKey;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user',
    },
    apiKey: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apiKeyExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    passwordChangedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    hooks: {
      // Hash password before save
      beforeSave: async (user: User) => {
        // Only run if password was modified
        if (!user.changed('password')) return;

        // Hash the password with cost of 12
        user.password = await bcrypt.hash(user.password, 12);

        // Update passwordChangedAt
        if (user.changed('password') && !user.isNewRecord) {
          user.passwordChangedAt = new Date(Date.now() - 1000); // -1s to account for delay in saving
        }
      },
    },
    sequelize,
    tableName: 'users',
    timestamps: true,
  },
);

export default User;
