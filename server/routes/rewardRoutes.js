const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const auth = require('../middleware/auth');

router.get('/', auth, rewardController.getRewards);
router.post('/update', auth, rewardController.updatePoints);
router.post('/earn', auth, rewardController.earnPoints);

module.exports = router;