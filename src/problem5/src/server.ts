import dotenv from 'dotenv';
import app from './app';
import { testConnection } from './modules/core/config/db.config';
import logger from './modules/core/utils/logger.util';
import { setupSwagger } from './modules/core/utils/swagger.util';

dotenv.config();

// Connect to database
testConnection();

// Setup Swagger documentation
setupSwagger(app);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}`);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', err => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(`${err}`);
  // Gracefully shutdown
  server.close(() => {
    process.exit(1);
  });
});
