const express = require('express');
const router = express.Router();
const choreController = require('../controllers/choreController');
const auth = require('../middleware/auth');

// Create chore (protected route)
router.post('/', auth, choreController.createChore);

// Get all chores (protected route)
router.get('/', auth, choreController.getChores);

// Update chore status (protected route)
router.put('/:id', auth, choreController.updateChoreStatus);

// Delete chore (protected route)
router.delete('/:id', auth, choreController.deleteChore);

module.exports = router;