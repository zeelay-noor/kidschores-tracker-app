const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// Get all chats
router.get('/', auth, chatController.getChats);

// Get specific chat
router.get('/:chatId', auth, chatController.getChat);

// Create or get chat
router.post('/create', auth, chatController.createChat);

// Send message
router.post('/:chatId/message', auth, chatController.sendMessage);

// Get unread count
router.get('/unread/count', auth, chatController.getUnreadCount);

module.exports = router;