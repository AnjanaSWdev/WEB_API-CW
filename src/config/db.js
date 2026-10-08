const mongoose = require('mongoose');

let connectionPromise = null;

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set in the environment');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection; // already connected, reuse it
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri).then(() => {
      console.log('MongoDB connected');
      return mongoose.connection;
    });
  }

  return connectionPromise; // a connection attempt is already in flight, reuse it
}

module.exports = connectDB;