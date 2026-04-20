const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  badges: [{
    name: String,
    icon: String,
    earnedAt: Date,
    description: String
  }],
  level: {
    type: Number,
    default: 1
  },
  // NEW: Streak System
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date,
    default: null
  },
  // NEW: Weekly/Monthly Stats
  weeklyPoints: {
    type: Number,
    default: 0
  },
  monthlyPoints: {
    type: Number,
    default: 0
  },
  weeklyTasksCompleted: {
    type: Number,
    default: 0
  },
  monthlyTasksCompleted: {
    type: Number,
    default: 0
  },
  // NEW: Champion History
  championTitles: [{
    title: String,
    earnedAt: Date,
    points: Number
  }],
  // Track when weekly/monthly was last reset
  lastWeeklyReset: {
    type: Date,
    default: Date.now
  },
  lastMonthlyReset: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Reward || mongoose.model('Reward', rewardSchema);