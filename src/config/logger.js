import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import config from '#config/index.js';

/**
 * Custom log format based on environment
 * @type {winston.Format}
 */
const env = process.env.NODE_ENV || 'local';
const logDir = 'logs';

const logFormat = env === 'production' || env === 'staging'
  ? winston.format.json()
  : winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
      }),
    );

/**
 * Winston logger instance
 * @type {winston.Logger}
 */
const transports = [new winston.transports.Console()];

// Add file transports only for non-production environments
if (env !== 'production' && env !== 'staging') {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, '%DATE%-combined.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
    new DailyRotateFile({
      filename: path.join(logDir, '%DATE%-error.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    })
  );
}

const logger = winston.createLogger({
  level: env === 'local' || env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    logFormat,
  ),
  transports,
});

// Add debug-level file transport for development/local
if (config.env === 'local' || config.env === 'development') {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  logger.add(
    new DailyRotateFile({
      filename: path.join(logDir, '%DATE%-debug.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'debug',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d',
    }),
  );
}

export default logger;