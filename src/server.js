import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import logger from '#config/logger.js';
import morganMiddleware from '#config/morgan.js';
import routes from '#routes/index.js';
import errorMiddleware from '#middleware/error.middleware.js';
import { setupSwagger } from '#docs/swagger.js';
import appConfig from '#config/index.js';
import path from 'path';

// Load environment variables
const envFile = `.env.${process.env.NODE_ENV || 'local'}`;
config({ path: envFile });

// Initialize Express app
const app = express();

// Apply global middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);

// Serve Swagger UI static assets
app.use(
  '/api-docs',
  express.static(path.join(__dirname, '../node_modules/swagger-ui-dist'))
);

// Setup Swagger documentation
setupSwagger(app);

// Mount routes
app.use('/', routes);

// Apply global error handling middleware
app.use(errorMiddleware);

/**
 * Start the server
 * @param {number} port - Port to listen on
 * @returns {Promise<http.Server>} - Server instance
 */
export const startServer = async (port = appConfig.port) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      logger.info(`Server running on port ${port} in ${appConfig.env} mode`);
      resolve(server);
    });

    server.on('error', (error) => {
      logger.error(`Server startup error: ${error.message}`);
      reject(error);
    });
  });
};

/**
 * Graceful shutdown handler
 * @param {http.Server} server - Server instance
 */
export const shutdownServer = (server) => {
  logger.info('Received shutdown signal. Closing server...');
  server.close(() => {
    logger.info('Server closed gracefully');
    process.exit(0);
  });
};

// Handle process termination signals
process.on('SIGINT', () => shutdownServer(app));
process.on('SIGTERM', () => shutdownServer(app));

export default app;