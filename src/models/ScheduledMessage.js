const mongoose = require('mongoose');

module.exports = mongoose.model('ScheduledMessage', new mongoose.Schema({
  message: { type: String, required: true, trim: true },
  scheduledAt: { type: Date, required: true, index: true },
  status: { type: String, enum: ['pending', 'inserted'], default: 'pending', index: true },
  insertedAt: Date
}, { timestamps: true }));
