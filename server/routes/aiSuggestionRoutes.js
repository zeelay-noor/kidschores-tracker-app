const express = require('express');
const router = express.Router();
const aiSuggestionController = require('../controllers/aiSuggestionController');
const auth = require('../middleware/auth');

// Get AI task suggestions
router.get('/suggestions', auth, aiSuggestionController.getSuggestions);

// Accept suggestion and create task
router.post('/accept', auth, aiSuggestionController.acceptSuggestion);

module.exports = router;