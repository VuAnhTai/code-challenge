import express, { Express } from 'express';
import cors from 'cors';
import productRoutes from './modules/product/product.routes';
import { errorHandler, notFoundHandler } from './modules/core/middleware/error.middleware';
import { setupSecurity } from './modules/core/middleware/security.middleware';
import { morganMiddleware, requestId } from './modules/core/middleware/logger.middleware';
import logger from './modules/core/utils/logger.util';

const app: Express = express();

// Setup security
setupSecurity(app);

// Request ID middleware
app.use(requestId);

// Logging middleware
app.use(morganMiddleware);

// CORS
app.use(cors());

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Routes
app.use('/api/products', productRoutes);

// Root route
app.get('/', (req, res) => {
  logger.info(`Home route accessed with request ID: ${req.id}`);
  res.send('API is running...');
});

// Handle undefined routes
// app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
