const connectDB = require('../src/config/db');
const app = require('../src/app');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB connection failed', err);
    res.status(500).json({
      error: { code: 'DB_CONNECTION_ERROR', message: 'Could not connect to database', detail: null }
    });
    return;
  }
  return app(req, res);
};