# Product API

A RESTful API for managing products built with Express.js, TypeScript, and PostgreSQL, following Clean Architecture principles with a modular structure.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL

## Code Quality

- ESLint for linting
- Prettier for code formatting
- Husky for pre-commit hooks

### Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the project
- `npm run start`: Start the production server
- `npm run test`: Run the tests
- `npm run lint`: Run the linting
- `npm run format`: Format the code
- `npm run prepare`: Install Husky pre-commit hooks

## Features

- CRUD operations for products with proper API design
- Clean Architecture with modular structure
- Filtering, sorting, and pagination
- Robust error handling
- Input validation with Joi
- Authentication and rate limiting
- API documentation with Swagger
- Logging system with Winston
- Testing setup with Jest

## Project Structure

src/
├── modules/ # Feature-based modules
│ ├── product/ # Product module
│ │ ├── product.controller.ts
│ │ ├── product.model.ts
│ │ ├── product.service.ts
│ │ ├── product.routes.ts
│ │ ├── product.schema.ts
│ │ ├── product.types.ts
│ │ └── product.test.ts
│ └── core/ # Core/shared module
│ │ ├── middleware/
│ │ │ ├── error.middleware.ts
│ │ │ ├── validator.middleware.ts
│ │ │ ├── security.middleware.ts
│ │ │ └── logger.middleware.ts
│ │ ├── utils/
│ │ │ ├── logger.util.ts
│ │ └── swagger.util.ts
│ └── config/
│ └── db.config.ts
├── app.ts
└── server.ts

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/product-api.git
   cd product-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:

   ```
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=product_db
   DB_USER=postgres
   DB_PASSWORD=password
   ```

4. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE product_db;
   ```

## Running the Application

### Development mode:

```bash
npm run dev
```

### Production mode:

```bash
npm run build
npm run start
```

## Testing

```bash
npm run test
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:

- Swagger UI: http://localhost:3000/api-docs
- JSON: http://localhost:3000/api-docs.json

## Best Practices Implemented

This API implements several best practices for Node.js/Express applications:

1. **Clean Architecture**

   - Service layer separation from controllers
   - Clear separation of concerns

2. **Error Handling**

   - Centralized error handling middleware
   - Custom error classes
   - Proper HTTP status codes

3. **Security**

   - Rate limiting to prevent brute force attacks
   - Helmet for security HTTP headers
   - Input validation to prevent injection attacks

4. **API Design**

   - RESTful endpoints
   - Consistent response format
   - Proper HTTP methods and status codes

5. **Logging**

   - Structured logging with Winston
   - HTTP request logging with Morgan
   - Request ID tracking

6. **Code Quality**

   - TypeScript for type safety
   - ESLint and Prettier for code style

7. **Testing**
   - Unit and integration testing with Jest
   - Test database setup

## API Endpoints

| Method | Endpoint          | Description                              |
| ------ | ----------------- | ---------------------------------------- |
| POST   | /api/products     | Create a new product                     |
| GET    | /api/products     | Get all products (with optional filters) |
| GET    | /api/products/:id | Get product by ID                        |
| PUT    | /api/products/:id | Update product                           |
| DELETE | /api/products/:id | Delete product                           |
