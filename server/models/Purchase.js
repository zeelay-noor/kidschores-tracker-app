const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rewardItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RewardItem',
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'fulfilled'],
    default: 'pending'
  },
  purchasedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  fulfilledAt: Date,
  notes: String
});

module.exports = mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);