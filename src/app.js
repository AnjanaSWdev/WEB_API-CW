const express = require('express');
const { errorHandler } = require('./middleware/errorHandler');
const conditionalGet = require('./middleware/conditionalGet');
const provinceRoutes = require('./routes/provinceRoutes');
const districtRoutes = require('./routes/districtRoutes');
const substationRoutes = require('./routes/substationRoutes');
const installationRoutes = require('./routes/installationRoutes');
const authRoutes = require('./routes/authRoutes');
const swaggerSpec = require('./config/swagger');

const app = express();

app.use(express.json());
app.use(conditionalGet);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/provinces', provinceRoutes);
app.use('/districts', districtRoutes);
app.use('/substations', substationRoutes);
app.use('/installations', installationRoutes);
app.use('/auth', authRoutes);

// Friendly root route instead of a 404 when someone opens the bare URL
app.get('/', (req, res) => {
  res.json({
    name: 'SLSEA Solar Generation Monitoring API',
    status: 'ok',
    docs: '/api-docs',
    health: '/health',
  });
});

// Raw OpenAPI spec as JSON
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

// Swagger UI page — loads its CSS/JS from a CDN instead of local static
// files, which Vercel's serverless bundler does not reliably package.
app.get('/api-docs', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>SLSEA API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api-docs.json',
        dom_id: '#swagger-ui',
      });
    };
  </script>
</body>
</html>`);
});

app.use((req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.originalUrl}`, detail: null }
  });
});

app.use(errorHandler);

module.exports = app;




