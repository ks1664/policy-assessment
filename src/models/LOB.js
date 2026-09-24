const mongoose = require('mongoose');

module.exports = mongoose.model('LOB', new mongoose.Schema({
  categoryName: { type: String, required: true, unique: true, trim: true }
}, { timestamps: true }));
