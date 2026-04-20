const Chat = require('../models/Chat');
const User = require('../models/User');

// Get all chats for user
exports.getChats = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    let chats;
    if (userRole === 'parent') {
      chats = await Chat.find({ parentId: userId })
        .populate('childId', 'name email')
        .populate('choreId', 'title')
        .sort({ lastMessageTime: -1 });
    } else {
      chats = await Chat.find({ childId: userId })
        .populate('parentId', 'name email')
        .populate('choreId', 'title')
        .sort({ lastMessageTime: -1 });
    }

    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Error fetching chats' });
  }
};

// Get specific chat
exports.getChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    const chat = await Chat.findById(chatId)
      .populate('parentId', 'name email')
      .populate('childId', 'name email')
      .populate('choreId', 'title');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is part of this chat
    if (chat.parentId._id.toString() !== userId && chat.childId._id.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Mark messages as read
    chat.messages.forEach(msg => {
      if (msg.senderId.toString() !== userId) {
        msg.read = true;
      }
    });
    await chat.save();

    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Error fetching chat' });
  }
};

// Create or get chat
exports.createChat = async (req, res) => {
  try {
    const { childId, choreId } = req.body;
    const parentId = req.userId;

    // Check if chat already exists
    let chat = await Chat.findOne({ parentId, childId, choreId: choreId || null });

    if (!chat) {
      const parent = await User.findById(parentId);
      const child = await User.findById(childId);

      chat = new Chat({
        parentId,
        childId,
        choreId: choreId || null,
        messages: []
      });
      await chat.save();
    }

    chat = await Chat.findById(chat._id)
      .populate('parentId', 'name email')
      .populate('childId', 'name email')
      .populate('choreId', 'title');

    res.json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Error creating chat' });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const senderId = req.userId;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Get sender info
    const sender = await User.findById(senderId);

    const newMessage = {
      senderId,
      senderName: sender.name,
      senderRole: sender.role,
      message,
      timestamp: new Date(),
      read: false
    };

    chat.messages.push(newMessage);
    chat.lastMessage = message;
    chat.lastMessageTime = new Date();

    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate('parentId', 'name email')
      .populate('childId', 'name email')
      .populate('choreId', 'title');

    res.json(updatedChat);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;

    const chats = await Chat.find({
      $or: [{ parentId: userId }, { childId: userId }]
    });

    let unreadCount = 0;
    chats.forEach(chat => {
      chat.messages.forEach(msg => {
        if (msg.senderId.toString() !== userId && !msg.read) {
          unreadCount++;
        }
      });
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Error getting unread count' });
  }
};