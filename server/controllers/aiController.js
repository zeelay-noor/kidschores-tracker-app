const axios = require('axios');

const encouragementMessages = [
  "Great job! Keep up the good work! 🌟",
  "You're doing amazing! Every chore completed makes you stronger! 💪",
  "Wow! You're on fire today! Keep going! 🔥",
  "Fantastic effort! You're becoming more responsible every day! ⭐",
  "Excellent work! Your hard work is paying off! 🎉",
  "You're a superstar! Keep shining bright! ✨",
  "Way to go! You're making everyone proud! 👏",
  "Incredible! You're unstoppable! 🚀",
  "Amazing progress! You're leveling up! 📈",
  "Outstanding! Keep crushing those goals! 🏆"
];

const studyEncouragement = [
  "Learning is your superpower! Keep studying! 📚",
  "Your brain is getting stronger with every lesson! 🧠",
  "Knowledge is power! You're doing great! 💡",
  "Every minute of study makes you smarter! 🎓",
  "You're building a bright future! Keep learning! 🌟"
];

// Get random encouragement
exports.getEncouragement = async (req, res) => {
  try {
    const { type } = req.query;
    
    const messages = type === 'study' ? studyEncouragement : encouragementMessages;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    res.json({ message: randomMessage, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get personalized message based on user progress
exports.getPersonalizedMessage = async (req, res) => {
  try {
    const Reward = require('../models/Reward');
    const reward = await Reward.findOne({ userId: req.userId });
    
    let message = '';
    
    if (!reward || reward.totalPoints === 0) {
      message = "Welcome! Start completing tasks to earn points and badges! 🎯";
    } else if (reward.totalPoints < 50) {
      message = `You have ${reward.totalPoints} points! Keep going to reach 50 and earn your first badge! 🏅`;
    } else if (reward.totalPoints < 100) {
      message = `Awesome! You're at ${reward.totalPoints} points! Reach 100 to level up! 🚀`;
    } else {
      message = `Incredible! You're at Level ${reward.level} with ${reward.totalPoints} points! You're a champion! 🏆`;
    }
    
    res.json({ message, points: reward?.totalPoints || 0, level: reward?.level || 1 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Analyze sentiment using ML model
exports.analyzeSentiment = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    // Call ML service
    const response = await axios.post('http://localhost:5001/predict', { text });
    
    const { sentiment, confidence } = response.data;
    
    // Generate appropriate response
    let encouragement = '';
    if (sentiment === 'positive') {
      encouragement = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
    } else {
      encouragement = "Don't give up! Every effort counts. You can do better! 💪";
    }
    
    res.json({
      sentiment,
      confidence,
      encouragement,
      analyzed_text: text
    });
  } catch (error) {
    console.error('ML Service Error:', error.message);
    res.status(500).json({ 
      message: 'ML service unavailable', 
      error: error.message 
    });
  }
};

module.exports = exports;