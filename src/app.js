const express = require('express');
const { errorHandler } = require('./middleware/errorHandler');
const conditionalGet = require('./middleware/conditionalGet');
const provinceRoutes = require('./routes/provinceRoutes');
const districtRoutes = require('./routes/districtRoutes');
const substationRoutes = require('./routes/substationRoutes');
const installationRoutes = require('./routes/installationRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use(conditionalGet);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/provinces', provinceRoutes);
app.use('/districts', districtRoutes);
app.use('/substations', substationRoutes);
app.use('/installations', installationRoutes);
app.use('/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.originalUrl}`, detail: null }
  });
});

app.use(errorHandler);

module.exports = app;
