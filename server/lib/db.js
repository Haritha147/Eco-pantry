const mongoose = require('mongoose');

function getMongoState() {
  return mongoose.connection.readyState;
}

function connectDatabase() {
  if (!process.env.MONGO_URI) return Promise.resolve();
  return mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
}

module.exports = { getMongoState, connectDatabase };
