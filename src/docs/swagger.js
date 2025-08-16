import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import path from 'path';
import pkg from '../../package.json' with { type: 'json' };
import logger from '#config/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
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
    // Serve JSON spec endpoint
    app.get('/api-docs/swagger.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.json(swaggerSpec);
    });

    // ✅ SOLUTION: Use CDN assets for Vercel
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      // CDN-based setup for production/Vercel
      const customHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>School ERP API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.10.5/favicon-32x32.png" sizes="32x32" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.10.5/favicon-16x16.png" sizes="16x16" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #fafafa; }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/api-docs/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        persistAuthorization: true,
        validatorUrl: null
      });
    };
  </script>
</body>
</html>`;

      app.get('/api-docs', (req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.send(customHtml);
      });
    } else {
      // Local development - use swagger-ui-express normally
      app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
          swaggerOptions: {
            persistAuthorization: true,
            validatorUrl: null,
            url: '/api-docs/swagger.json',
          },
          customSiteTitle: 'School ERP API Documentation',
        })
      );
    }

    logger.info('✅ Swagger UI mounted at /api-docs');
  } catch (error) {
    logger.error(`Swagger setup error: ${error.message}`);
  }
};