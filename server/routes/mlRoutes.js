const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');
const auth = require('../middleware/auth');

// Get ML service health
router.get('/health', mlController.getMLHealth);

// Predict task completion (authenticated)
router.post('/predict', auth, mlController.predictTaskCompletion);

module.exports = router;