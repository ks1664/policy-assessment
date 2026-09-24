const mongoose = require('mongoose');
const { MONGO_URI } = require('./config');

async function connectDB() {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');
}

module.exports = connectDB;
