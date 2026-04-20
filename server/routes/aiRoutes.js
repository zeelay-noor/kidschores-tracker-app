const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

router.get('/encouragement', auth, aiController.getEncouragement);
router.get('/personalized', auth, aiController.getPersonalizedMessage);
router.post('/analyze', auth, aiController.analyzeSentiment);

module.exports = router;