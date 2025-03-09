import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../utils/logger.util';

dotenv.config();

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: msg => logger.debug(msg), // Use logger for SQL queries
});

// Test database connection function
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Connection to PostgreSQL has been established successfully.');
    
    // Sync all models
    await sequelize.sync();
    logger.info('All models synchronized with database.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

export default sequelize; 