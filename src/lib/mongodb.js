import mongoose from 'mongoose';
import config from '#config/index.js';
import logger from '#config/logger.js';

let isConnected = false;

/**
 * Connect to MongoDB with retry logic
 * @returns {Promise<void>}
 * @throws {Error} If connection fails after retries
 */
export const connectMongoDB = async () => {
  if (isConnected) {
    logger.info('⚡ MongoDB already connected');
    return;
  }

  if (!config.dbUri) {
    logger.error('MongoDB URI is missing in configuration');
    throw new Error('MongoDB URI is required');
  }

  const maxRetries = 5;
  let attempt = 1;

  while (attempt <= maxRetries) {
    try {
      await mongoose.connect(config.dbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      isConnected = true;
      logger.info(`✅ MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (error) {
      logger.error(`❌ MongoDB connection attempt ${attempt} failed: ${error.message}`);
      if (attempt === maxRetries) {
        logger.error('❌ Max retries reached. MongoDB connection failed');
        throw new Error('MongoDB connection failed');
      }
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
      attempt++;
    }
  }
};

/**
 * Gracefully disconnect from MongoDB
 * @returns {Promise<void>}
 */
export const disconnectMongoDB = async () => {
  if (!isConnected) {
    logger.info('⚡ MongoDB already disconnected');
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('🔌 MongoDB disconnected');
  } catch (error) {
    logger.error(`❌ MongoDB disconnection error: ${error.message}`);
  }
};

// Log MongoDB connection events
mongoose.connection.on('connected', () => {
  logger.info('MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection disconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error(`MongoDB connection error: ${error.message}`);
});

// TODO: Add connection pooling configuration for production scalability