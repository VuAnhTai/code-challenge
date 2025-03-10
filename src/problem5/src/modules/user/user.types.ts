export interface IUser {
  id?: number;
  email: string;
  name: string;
  password: string;
  role: 'user' | 'admin';
  apiKey?: string;
  apiKeyExpires?: Date;
  active: boolean;
  passwordChangedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserResponse {
  id: number;
  email: string;
  name: string;
  role: string;
  apiKey?: string;
  apiKeyExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDecodedToken {
  id: number;
  role: string;
  iat: number;
  exp: number;
}
