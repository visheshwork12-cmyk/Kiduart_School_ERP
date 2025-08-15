import '#config/loadEnv.js';
import express from 'express';
import logger from '#config/logger.js';
import { connectMongoDB, disconnectMongoDB } from '#lib/mongodb.js';
import { connectRedis, disconnectRedis } from '#lib/redis.js';
import { startServer, shutdownServer } from './server.js';
import { initI18n } from '#shared/i18n/index.js';

import passport from '#config/passport.js';
// import  validateEnv  from '#config/env/local.js';

/**
 * Initialize application with database connections, i18n, and start server
 * @returns {Promise<void>}
 */
const initializeApp = async () => {
  const app = express();

  try {
    // Initialize i18n
    await initI18n(app);

    // Initialize Passport
    app.use(passport);

    // Connect to databases
    await connectMongoDB();
    await connectRedis();

    // Start the server
    const server = await startServer();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('🔻 SIGINT received: shutting down...');
      await disconnectMongoDB();
      await disconnectRedis();
      shutdownServer(server);
    });

    process.on('SIGTERM', async () => {
      logger.info('🔻 SIGTERM received: shutting down...');
      await disconnectMongoDB();
      await disconnectRedis();
      shutdownServer(server);
    });

    // Handle unexpected errors
    process.on('unhandledRejection', (reason, promise) => {
      logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
      shutdownServer(server);
    });

    process.on('uncaughtException', (error) => {
      logger.error(`Uncaught Exception: ${error.message}`);
      shutdownServer(server);
    });
  } catch (error) {
    logger.error(`Application startup failed: ${error.message}`);
    process.exit(1); // Fail fast on critical errors
  }
};

// validateEnv();

// Start the application
initializeApp();

// TODO: Add initialization for other services (e.g., message queues, external APIs)