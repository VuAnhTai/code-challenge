import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import fs from 'fs';
import path from 'path';
import { productSchemas } from '../../product/product.schema';
import { userSchemas } from '../../user/user.schema';
const version = '1.0.0';
// Read environment variables
const environment = process.env.NODE_ENV || 'development';
const serverUrl = process.env.API_URL || 'http://localhost:3000';

// Build a better description from README (if exists)
let description = 'Product API Documentation';
try {
  // Try to read the first section of README.md for API description
  const readmePath = path.join(__dirname, '../../../../README.md');
  if (fs.existsSync(readmePath)) {
    const readme = fs.readFileSync(readmePath, 'utf8');
    const firstSection = readme.split('##')[0].trim();
    if (firstSection) {
      description = firstSection;
    }
  }
} catch (err) {
  console.error('Could not read README.md for API description');
}

// Define common response schemas
const responseSchemas = {
  ErrorResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['fail', 'error'],
        example: 'fail',
      },
      message: {
        type: 'string',
        example: 'Resource not found',
      },
    },
  },
  ValidationError: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['fail'],
        example: 'fail',
      },
      message: {
        type: 'string',
        example: 'name length must be at least 2 characters long',
      },
    },
  },
  ServerError: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['error'],
        example: 'error',
      },
      message: {
        type: 'string',
        example: 'Something went wrong',
      },
    },
  },
};

// Define security schemes
const securitySchemes = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  },
  apiKey: {
    type: 'apiKey',
    in: 'header',
    name: 'X-API-KEY',
  },
};

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Product API',
      version,
      description,
      contact: {
        name: 'API Support',
        email: 'support@example.com',
        url: 'https://example.com/support',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: serverUrl,
        description: `${environment.charAt(0).toUpperCase() + environment.slice(1)} server`,
      },
    ],
    components: {
      schemas: {
        ...responseSchemas,
        ...productSchemas,
        ...userSchemas,
      },
      securitySchemes,
      parameters: {
        skipParam: {
          name: 'skip',
          in: 'query',
          description: 'Number of items to skip for pagination',
          schema: {
            type: 'integer',
            default: 0,
            minimum: 0,
          },
        },
        limitParam: {
          name: 'limit',
          in: 'query',
          description: 'Maximum number of items to return',
          schema: {
            type: 'integer',
            default: 10,
            minimum: 1,
            maximum: 100,
          },
        },
        sortParam: {
          name: 'sort',
          in: 'query',
          description: 'Sort criteria (prefix with - for descending order)',
          schema: {
            type: 'string',
            example: '-createdAt',
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Bad Request - Invalid input data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError',
              },
            },
          },
        },
        Unauthorized: {
          description: 'Unauthorized - Missing or invalid authentication',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        Forbidden: {
          description: 'Forbidden - Not allowed to access this resource',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        NotFound: {
          description: 'Not Found - The requested resource was not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        ServerError: {
          description: 'Server Error - Something went wrong on the server',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ServerError',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Products',
        description: 'Everything about products',
      },
      {
        name: 'Health',
        description: 'API health and status',
      },
    ],
    externalDocs: {
      description: 'Find out more about the API',
      url: 'https://example.com/docs',
    },
  },
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.schema.ts', './src/app.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  // Custom swagger CSS (optional)
  const customCss = `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 30px 0 }
    .swagger-ui .scheme-container { padding: 15px 0 }
    .swagger-ui .renderedMarkdown p { margin-top: 0 }
  `;

  const swaggerUiOptions = {
    explorer: true,
    customCss,
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  };

  // Swagger page
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  // Docs in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'max-age=3600'); // 1 hour cache
    res.send(swaggerSpec);
  });

  // Add a simple healthcheck endpoint and document it with swagger
  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Check API health status
   *     description: Use this endpoint to verify the API is running properly
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: API is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: up
   *                 uptime:
   *                   type: number
   *                   example: 3600
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                   example: 2023-04-14T12:00:00Z
   *                 version:
   *                   type: string
   *                   example: 1.0.0
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  app.get('/health', (req, res) => {
    res.json({
      status: 'up',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version,
    });
  });
};
