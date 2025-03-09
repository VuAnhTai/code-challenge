import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().required().min(10),
  price: Joi.number().required().min(0),
  category: Joi.string().required(),
  inStock: Joi.boolean().default(true),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().min(10),
  price: Joi.number().min(0),
  category: Joi.string(),
  inStock: Joi.boolean(),
}).min(1); // At least one field must be provided

export const productSchemas = {
  Product: {
    type: 'object',
    required: ['name', 'description', 'price', 'category'],
    properties: {
      id: {
        type: 'integer',
        description: 'The auto-generated id of the product',
      },
      name: {
        type: 'string',
        description: 'The name of the product',
      },
      description: {
        type: 'string',
        description: 'The description of the product',
      },
      price: {
        type: 'number',
        description: 'The price of the product',
      },
      category: {
        type: 'string',
        description: 'The category of the product',
      },
      inStock: {
        type: 'boolean',
        description: 'Whether the product is in stock',
        default: true,
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'The date of product creation',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'The date of last product update',
      },
    },
    example: {
      id: 1,
      name: 'iPhone 13',
      description: 'The latest iPhone with A15 Bionic chip',
      price: 999.99,
      category: 'electronics',
      inStock: true,
      createdAt: '2023-01-10T04:05:06.157Z',
      updatedAt: '2023-01-10T04:05:06.157Z',
    },
  },

  CreateProductInput: {
    type: 'object',
    required: ['name', 'description', 'price', 'category'],
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 100,
        description: 'The name of the product',
      },
      description: {
        type: 'string',
        minLength: 10,
        description: 'A detailed description of the product',
      },
      price: {
        type: 'number',
        minimum: 0,
        description: 'The price of the product',
      },
      category: {
        type: 'string',
        description: 'The category the product belongs to',
      },
      inStock: {
        type: 'boolean',
        default: true,
        description: 'Whether the product is in stock',
      },
    },
    example: {
      name: 'MacBook Pro',
      description: 'Powerful laptop with M1 chip',
      price: 1999.99,
      category: 'electronics',
      inStock: true,
    },
  },

  UpdateProductInput: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 100,
        description: 'The name of the product',
      },
      description: {
        type: 'string',
        minLength: 10,
        description: 'A detailed description of the product',
      },
      price: {
        type: 'number',
        minimum: 0,
        description: 'The price of the product',
      },
      category: {
        type: 'string',
        description: 'The category the product belongs to',
      },
      inStock: {
        type: 'boolean',
        description: 'Whether the product is in stock',
      },
    },
    example: {
      name: 'Updated MacBook Pro',
      price: 1899.99,
      inStock: false,
    },
  },
};
