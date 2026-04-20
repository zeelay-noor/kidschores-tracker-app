const mongoose = require('mongoose');

const rewardItemSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    required: true,
    min: 1
  },
  icon: {
    type: String,
    default: '🎁'
  },
  category: {
    type: String,
    enum: ['fun', 'food', 'privilege', 'toy', 'outing', 'other'],
    default: 'other'
  },
  stock: {
    type: Number,
    default: -1 // -1 means unlimited
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.RewardItem || mongoose.model('RewardItem', rewardItemSchema);