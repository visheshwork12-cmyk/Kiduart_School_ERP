import morgan from "morgan";
import logger from "#config/logger.js";
import config from "#config/index.js";

/**
 * Custom stream to integrate Morgan with Winston
 * @type {Object}
 */
const stream = {
  write: (message) => logger.http(message.trim()),
};

/**
 * Skip logging in test environment
 * @returns {boolean}
 */
const skip = () => config.env === "test";

/**
 * Morgan middleware with environment-specific format
 * @type {Function}
 */
const morganMiddleware = morgan(
  config.env === "local" || config.env === "development" ? "dev" : "combined",
  { stream, skip },
);

// TODO: Add custom Morgan tokens for tenantId or userId logging

export default morganMiddleware;
