import Joi from 'joi';

export const registerUserSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  email: Joi.string().required().email(),
  password: Joi.string()
    .required()
    .min(8)
    .max(50),
    // .pattern(
    //   new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])'),
    //   'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    // ),
  passwordConfirm: Joi.string()
    .required()
    .valid(Joi.ref('password'))
    .messages({ 'any.only': 'Passwords do not match' }),
  // just allow role when env is test
  role: Joi.string().optional().valid('user', 'admin').when('NODE_ENV', {
    is: 'test',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required(),
});

export const userSchemas = {
  User: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: 'The auto-generated id of the user',
      },
      name: {
        type: 'string',
        description: 'The name of the user',
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'The email of the user',
      },
      role: {
        type: 'string',
        enum: ['user', 'admin'],
        description: 'The role of the user',
      },
      apiKey: {
        type: 'string',
        description: 'API key for programmatic access (only visible once)',
      },
      apiKeyExpires: {
        type: 'string',
        format: 'date-time',
        description: 'Expiration date for the API key',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'The date of user creation',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'The date of last user update',
      },
    },
    example: {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      createdAt: '2023-01-10T04:05:06.157Z',
      updatedAt: '2023-01-10T04:05:06.157Z',
    },
  },
  RegisterUserInput: {
    type: 'object',
    required: ['name', 'email', 'password', 'passwordConfirm'],
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 100,
        description: 'The name of the user',
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'The email of the user',
      },
      password: {
        type: 'string',
        format: 'password',
        minLength: 8,
        description:
          'User password (must contain uppercase, lowercase, number, and special character)',
      },
      passwordConfirm: {
        type: 'string',
        format: 'password',
        description: 'Confirm password (must match password)',
      }
    },
  },
  LoginUserInput: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'The email of the user',
      },
      password: {
        type: 'string',
        format: 'password',
        description: 'User password',
      },
    },
  },
  AuthResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        example: 'success',
      },
      token: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
      data: {
        $ref: '#/components/schemas/User',
      },
    },
  },
  ApiKeyResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        example: 'success',
      },
      apiKey: {
        type: 'string',
        example: '7f58a0650aa43ae6535ce193b71b9a6f...',
      },
      expiresAt: {
        type: 'string',
        format: 'date-time',
      },
    },
  },
};
