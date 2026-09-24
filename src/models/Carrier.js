const mongoose = require('mongoose');

module.exports = mongoose.model('Carrier', new mongoose.Schema({
  companyName: { type: String, required: true, unique: true, trim: true }
}, { timestamps: true }));
