import { createClient } from 'redis';
import config from '#config/index.js';
import logger from '#config/logger.js';

let client;

/**
 * Connect to Redis with retry logic
 * @returns {Promise<import('redis').RedisClientType>} Redis client instance
 * @throws {Error} If connection fails after retries
 */
export const connectRedis = async () => {
  if (client?.isOpen) {
    logger.info('⚡ Redis already connected');
    return client;
  }

  if (!config.redisUri) {
    logger.error('Redis URI is missing in configuration');
    throw new Error('Redis URI is required');
  }

  client = createClient({
    url: config.redisUri,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000); // Exponential backoff, max 2 seconds
      logger.warn(`Redis reconnect attempt #${times}, retrying in ${delay}ms`);
      return delay;
    },
  });

  client.on('error', (error) => {
    logger.error(`❌ Redis client error: ${error.message}`);
  });

  client.on('reconnecting', () => {
    logger.info('Redis client reconnecting...');
  });

  try {
    await client.connect();
    logger.info('✅ Redis connected');
    return client;
  } catch (error) {
    logger.error(`❌ Redis connection failed: ${error.message}`);
    throw error;
  }
};

/**
 * Gracefully disconnect from Redis
 * @returns {Promise<void>}
 */
export const disconnectRedis = async () => {
  if (!client?.isOpen) {
    logger.info('⚡ Redis already disconnected');
    return;
  }

  try {
    await client.quit();
    logger.info('🔌 Redis disconnected');
  } catch (error) {
    logger.error(`❌ Redis disconnection error: ${error.message}`);
  }
};

// TODO: Add Redis clustering support for high-availability setups
export { client as redisClient };