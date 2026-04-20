const { updateStreak } = require('./leaderboardController');
const Reward = require('../models/Reward');
const Chore = require('../models/Chore');

// Get user rewards
exports.getRewards = async (req, res) => {
  try {
    const userId = req.userId; // FIXED: Changed from req.user.id to req.userId
    
    let reward = await Reward.findOne({ userId });
    
    if (!reward) {
      reward = new Reward({ userId });
      await reward.save();
    }
    
    res.json(reward);
  } catch (error) {
    console.error('Error getting rewards:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Earn points (NEW - for voice commands and manual completion)
exports.earnPoints = async (req, res) => {
  try {
    const { points } = req.body;
    const userId = req.userId; // FIXED: Changed from req.user.id to req.userId

    let reward = await Reward.findOne({ userId });
    
    if (!reward) {
      reward = new Reward({ userId });
    }
    
    // Add points
    reward.totalPoints = (reward.totalPoints || 0) + points;
    
    // Update streak
    await updateStreak(userId);
    
    // Update weekly/monthly points
    reward.weeklyPoints = (reward.weeklyPoints || 0) + points;
    reward.monthlyPoints = (reward.monthlyPoints || 0) + points;
    reward.weeklyTasksCompleted = (reward.weeklyTasksCompleted || 0) + 1;
    reward.monthlyTasksCompleted = (reward.monthlyTasksCompleted || 0) + 1;
    
    // Level up every 100 points
    reward.level = Math.floor(reward.totalPoints / 100) + 1;
    
    // Award badges
    if (reward.totalPoints >= 50 && !reward.badges.find(b => b.name === 'First 50')) {
      reward.badges.push({ 
        name: 'First 50', 
        icon: '⭐',
        description: 'Earned your first 50 points!',
        earnedAt: new Date() 
      });
    }
    if (reward.totalPoints >= 100 && !reward.badges.find(b => b.name === 'Century')) {
      reward.badges.push({ 
        name: 'Century', 
        icon: '💯',
        description: 'Reached 100 points!',
        earnedAt: new Date() 
      });
    }
    if (reward.totalPoints >= 500 && !reward.badges.find(b => b.name === '500 Club')) {
      reward.badges.push({ 
        name: '500 Club', 
        icon: '🌟',
        description: 'Amazing! 500 points!',
        earnedAt: new Date() 
      });
    }
    if (reward.totalPoints >= 1000 && !reward.badges.find(b => b.name === 'Legendary')) {
      reward.badges.push({ 
        name: 'Legendary', 
        icon: '👑',
        description: 'You are a legend! 1000 points!',
        earnedAt: new Date() 
      });
    }
    
    await reward.save();
    res.json(reward);
  } catch (error) {
    console.error('Error earning points:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update points when chore completed
exports.updatePoints = async (req, res) => {
  try {
    const { choreId } = req.body;
    
    const chore = await Chore.findById(choreId);
    if (!chore || chore.status !== 'completed') {
      return res.status(400).json({ message: 'Chore not completed' });
    }
    
    let reward = await Reward.findOne({ userId: chore.assignedTo });
    
    if (!reward) {
      reward = new Reward({ userId: chore.assignedTo });
    }
    
    // Add points
    reward.totalPoints = (reward.totalPoints || 0) + chore.points;
    
    // Update streak
    await updateStreak(chore.assignedTo);
    
    // Update weekly/monthly points
    reward.weeklyPoints = (reward.weeklyPoints || 0) + chore.points;
    reward.monthlyPoints = (reward.monthlyPoints || 0) + chore.points;
    reward.weeklyTasksCompleted = (reward.weeklyTasksCompleted || 0) + 1;
    reward.monthlyTasksCompleted = (reward.monthlyTasksCompleted || 0) + 1;
    
    // Level up every 100 points
    reward.level = Math.floor(reward.totalPoints / 100) + 1;
    
    // Award badges
    if (reward.totalPoints >= 50 && !reward.badges.find(b => b.name === 'First 50')) {
      reward.badges.push({ 
        name: 'First 50', 
        icon: '⭐',
        description: 'Earned your first 50 points!',
        earnedAt: new Date() 
      });
    }
    if (reward.totalPoints >= 100 && !reward.badges.find(b => b.name === 'Century')) {
      reward.badges.push({ 
        name: 'Century', 
        icon: '💯',
        description: 'Reached 100 points!',
        earnedAt: new Date() 
      });
    }
    
    await reward.save();
    res.json(reward);
  } catch (error) {
    console.error('Error updating points:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = exports;