const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SLSEA Solar Generation Monitoring API',
      version: '1.0.0',
      description: 'REST API for monitoring solar installation generation data across SLSEA\'s provincial/district hierarchy',
    },
    servers: [
      { url: 'https://web-api-cwdeploy.vercel.app', description: 'Production' },
      { url: 'http://localhost:3000', description: 'Local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        apiKeyAuth: { type: 'apiKey', in: 'header', name: 'x-api-key' },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);