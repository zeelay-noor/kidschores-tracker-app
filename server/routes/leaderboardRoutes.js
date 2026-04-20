const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const auth = require('../middleware/auth');

// Get all-time leaderboard
router.get('/', auth, leaderboardController.getLeaderboard);

// Get weekly leaderboard
router.get('/weekly', auth, leaderboardController.getWeeklyLeaderboard);

// Get monthly leaderboard
router.get('/monthly', auth, leaderboardController.getMonthlyLeaderboard);

// Get user stats
router.get('/stats', auth, leaderboardController.getUserStats);

module.exports = router;