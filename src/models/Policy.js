const mongoose = require('mongoose');

module.exports = mongoose.model('Policy', new mongoose.Schema({
  policyNumber: { type: String, required: true, unique: true, index: true },
  policyStartDate: Date,
  policyEndDate: Date,
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'LOB' },
  carrierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Carrier' }
}, { timestamps: true }));
