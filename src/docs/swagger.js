import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import path from 'path';
import pkg from '../../package.json' with { type: 'json' };
import logger from '#config/logger.js';

// Get the directory name for resolving file paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Swagger definition for OpenAPI 3.0
const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: pkg.name || 'School ERP Backend',
    version: pkg.version || '1.0.0',
    description: pkg.description || 'API documentation for the School ERP Backend',
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}/api/v1`,
      description: 'Local development server',
    },
    {
      url: process.env.PRODUCTION_API_URL || 'https://kiduart-school-erp.vercel.app/api/v1',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, '../api/v1/**/*.routes.js')],
};

export const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
  try {
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
          persistAuthorization: true,
          url: '/api-docs/swagger.json',
        },
      })
    );
    logger.info('Swagger UI mounted at /api-docs');
  } catch (error) {
    logger.error(`Swagger setup error: ${error.message}`);
  }
};