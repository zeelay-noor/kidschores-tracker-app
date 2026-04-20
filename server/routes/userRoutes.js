const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/children', auth, userController.getChildren);
router.post('/children', auth, userController.addChild);
router.delete('/children/:id', auth, userController.deleteChild);

module.exports = router;