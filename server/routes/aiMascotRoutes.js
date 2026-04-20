const express = require('express');
const router = express.Router();
const aiMascotController = require('../controllers/aiMascotController');
const auth = require('../middleware/auth');

router.post('/message', auth, aiMascotController.generateMessage);

module.exports = router;