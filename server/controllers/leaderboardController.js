const Reward = require('../models/Reward');
const User = require('../models/User');

// Get Leaderboard (All Time) - ONLY CHILDREN
exports.getLeaderboard = async (req, res) => {
  try {
    // First get all children (role = 'child')
    const children = await User.find({ role: 'child' }).select('_id');
    const childrenIds = children.map(child => child._id);

    const leaderboard = await Reward.find({ userId: { $in: childrenIds } })
      .populate('userId', 'name email role')
      .sort({ totalPoints: -1 })
      .limit(10);

    const formattedLeaderboard = leaderboard
      .filter(entry => entry.userId && entry.userId.role === 'child') // Double check
      .map((entry, index) => ({
        rank: index + 1,
        name: entry.userId?.name || 'Unknown',
        email: entry.userId?.email || '',
        totalPoints: entry.totalPoints,
        level: entry.level,
        currentStreak: entry.currentStreak || 0,
        longestStreak: entry.longestStreak || 0,
        badges: entry.badges?.length || 0,
        championTitles: entry.championTitles?.length || 0
      }));

    res.json(formattedLeaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

// Get Weekly Leaderboard - ONLY CHILDREN
exports.getWeeklyLeaderboard = async (req, res) => {
  try {
    // First get all children (role = 'child')
    const children = await User.find({ role: 'child' }).select('_id');
    const childrenIds = children.map(child => child._id);

    const leaderboard = await Reward.find({ userId: { $in: childrenIds } })
      .populate('userId', 'name email role')
      .sort({ weeklyPoints: -1 })
      .limit(10);

    const formattedLeaderboard = leaderboard
      .filter(entry => entry.userId && entry.userId.role === 'child') // Double check
      .map((entry, index) => ({
        rank: index + 1,
        name: entry.userId?.name || 'Unknown',
        email: entry.userId?.email || '',
        weeklyPoints: entry.weeklyPoints || 0,
        weeklyTasksCompleted: entry.weeklyTasksCompleted || 0,
        currentStreak: entry.currentStreak || 0
      }));

    res.json(formattedLeaderboard);
  } catch (error) {
    console.error('Error fetching weekly leaderboard:', error);
    res.status(500).json({ message: 'Error fetching weekly leaderboard' });
  }
};

// Get Monthly Leaderboard - ONLY CHILDREN
exports.getMonthlyLeaderboard = async (req, res) => {
  try {
    // First get all children (role = 'child')
    const children = await User.find({ role: 'child' }).select('_id');
    const childrenIds = children.map(child => child._id);

    const leaderboard = await Reward.find({ userId: { $in: childrenIds } })
      .populate('userId', 'name email role')
      .sort({ monthlyPoints: -1 })
      .limit(10);

    const formattedLeaderboard = leaderboard
      .filter(entry => entry.userId && entry.userId.role === 'child') // Double check
      .map((entry, index) => ({
        rank: index + 1,
        name: entry.userId?.name || 'Unknown',
        email: entry.userId?.email || '',
        monthlyPoints: entry.monthlyPoints || 0,
        monthlyTasksCompleted: entry.monthlyTasksCompleted || 0,
        currentStreak: entry.currentStreak || 0
      }));

    res.json(formattedLeaderboard);
  } catch (error) {
    console.error('Error fetching monthly leaderboard:', error);
    res.status(500).json({ message: 'Error fetching monthly leaderboard' });
  }
};

// Update Streak (called when task completed)
exports.updateStreak = async (userId) => {
  try {
    const reward = await Reward.findOne({ userId });
    if (!reward) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = reward.lastActivityDate ? new Date(reward.lastActivityDate) : null;
    
    if (lastActivity) {
      lastActivity.setHours(0, 0, 0, 0);
      const dayDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        // Consecutive day - increase streak
        reward.currentStreak = (reward.currentStreak || 0) + 1;
        if (reward.currentStreak > (reward.longestStreak || 0)) {
          reward.longestStreak = reward.currentStreak;
        }
      } else if (dayDiff > 1) {
        // Streak broken
        reward.currentStreak = 1;
      }
      // If dayDiff === 0, same day, don't change streak
    } else {
      // First activity ever
      reward.currentStreak = 1;
      reward.longestStreak = 1;
    }

    reward.lastActivityDate = new Date();

    // Check for streak badges
    await checkStreakBadges(reward);

    await reward.save();
  } catch (error) {
    console.error('Error updating streak:', error);
  }
};

// Check and award streak badges
const checkStreakBadges = async (reward) => {
  const streakBadges = [
    { name: '🔥 3-Day Streak', icon: '🔥', threshold: 3, description: 'Completed tasks for 3 days in a row!' },
    { name: '⚡ 7-Day Warrior', icon: '⚡', threshold: 7, description: 'One full week streak!' },
    { name: '💪 15-Day Champion', icon: '💪', threshold: 15, description: '15 days of consistency!' },
    { name: '🏆 30-Day Legend', icon: '🏆', threshold: 30, description: 'A full month streak!' },
    { name: '👑 100-Day Master', icon: '👑', threshold: 100, description: '100 days of excellence!' }
  ];

  for (const badge of streakBadges) {
    if ((reward.currentStreak || 0) >= badge.threshold) {
      const hasBadge = reward.badges?.some(b => b.name === badge.name);
      if (!hasBadge) {
        if (!reward.badges) reward.badges = [];
        reward.badges.push({
          name: badge.name,
          icon: badge.icon,
          description: badge.description,
          earnedAt: new Date()
        });
      }
    }
  }
};

// Get User Stats (for profile) - ONLY IF USER IS CHILD
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.userId; // FIXED: Changed from req.user.id to req.userId
    
    // Check if user is a child
    const user = await User.findById(userId);
    if (!user || user.role !== 'child') {
      return res.status(403).json({ message: 'Only children can view stats' });
    }

    const reward = await Reward.findOne({ userId });

    if (!reward) {
      // Return default stats if no reward found
      return res.json({
        totalPoints: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        weeklyPoints: 0,
        monthlyPoints: 0,
        badges: [],
        championTitles: []
      });
    }

    res.json({
      totalPoints: reward.totalPoints || 0,
      level: reward.level || 1,
      currentStreak: reward.currentStreak || 0,
      longestStreak: reward.longestStreak || 0,
      weeklyPoints: reward.weeklyPoints || 0,
      monthlyPoints: reward.monthlyPoints || 0,
      badges: reward.badges || [],
      championTitles: reward.championTitles || []
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Error fetching user stats' });
  }
};