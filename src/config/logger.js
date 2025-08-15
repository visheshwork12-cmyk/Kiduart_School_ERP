import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import config from "#config/index.js";

/**
 * Custom log format based on environment
 * @type {winston.Format}
 */
const env = process.env.NODE_ENV || 'local';
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
const logger = winston.createLogger({
  level: env === 'local' || env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }), // Include stack traces for errors
    logFormat,
  ),
  transports: [
    // Console transport for all environments
    new winston.transports.Console(),
    // Daily rotating file transport for all environments
    new DailyRotateFile({
      filename: "logs/%DATE%-combined.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d", // Keep logs for 14 days
    }),
    new DailyRotateFile({
      filename: "logs/%DATE%-error.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

// Add debug-level file transport for development/local
if (config.env === "local" || config.env === "development") {
  logger.add(
    new DailyRotateFile({
      filename: "logs/%DATE%-debug.log",
      datePattern: "YYYY-MM-DD",
      level: "debug",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "7d", // Keep debug logs for 7 days
    }),
  );
}

// TODO: Add additional transports (e.g., cloud logging service) for production

export default logger;
