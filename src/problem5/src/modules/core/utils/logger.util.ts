import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define your severity levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define different colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Console format (more like console.log)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.printf(info => {
    // Simple message-only output for strings
    if (typeof info.message === 'string' && Object.keys(info).length <= 3) {
      return `${info.level}: ${info.message}`;
    }

    // If message contains an object or additional fields, include them
    const baseMessage = `${info.level}: ${info.message}`;
    const meta = { ...info };
    const { message, timestamp, level, ...metaFields } = meta;
    // Only include meta if it has properties
    if (Object.keys(metaFields).length === 0) {
      return baseMessage;
    }

    // Pretty print the additional data
    return `${baseMessage}\n${JSON.stringify(meta, null, 2)}`;
  }),
);

// File format (more structured)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.json(),
);

// Define which transports the logger must use
const transports = [
  // Console for development - always show logs in console
  new winston.transports.Console({
    format: consoleFormat,
  }),
  // File for production logs
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: fileFormat,
  }),
  new winston.transports.File({
    filename: path.join(logDir, 'all.log'),
    format: fileFormat,
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  transports,
});

const enhancedLogger = {
  error: (message: any, ...meta: any[]) => {
    if (meta.length > 0) {
      logger.error(message, { meta });
    } else {
      logger.error(message);
    }
  },
  warn: (message: any, ...meta: any[]) => {
    if (meta.length > 0) {
      logger.warn(message, { meta });
    } else {
      logger.warn(message);
    }
  },
  info: (message: any, ...meta: any[]) => {
    if (meta.length > 0) {
      logger.info(message, { meta });
    } else {
      logger.info(message);
    }
  },
  http: (message: any, ...meta: any[]) => {
    if (meta.length > 0) {
      logger.http(message, { meta });
    } else {
      logger.http(message);
    }
  },
  debug: (message: any, ...meta: any[]) => {
    if (meta.length > 0) {
      logger.debug(message, { meta });
    } else {
      logger.debug(message);
    }
  },
};

export default enhancedLogger;
