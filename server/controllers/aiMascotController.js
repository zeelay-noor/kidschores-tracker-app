// Smart message generator without external API
const generateSmartMessage = (data) => {
  const { taskCompletionRate, totalPointsToday, currentStreak, timeOfDay, ageGroup } = data;
  
  let messages = [];
  let mood = 'happy';
  let animation = 'normal';

  // High performance messages
  if (taskCompletionRate >= 80) {
    mood = 'celebrating';
    animation = 'celebration';
    messages = [
      `Amazing work! ${taskCompletionRate}% completion rate! You're a superstar! 🌟`,
      `Wow! ${totalPointsToday} points today! You're on fire! 🔥`,
      `Incredible! ${taskCompletionRate}% done! Keep this momentum going! 🚀`,
      `You're crushing it! ${currentStreak} day streak! Unstoppable! 💪`,
      `Outstanding! ${totalPointsToday} points earned! You're amazing! ⭐`
    ];
  }
  // Good performance messages
  else if (taskCompletionRate >= 50) {
    mood = 'happy';
    animation = 'normal';
    messages = [
      `Great job! ${taskCompletionRate}% completed! Keep going! 😊`,
      `You've earned ${totalPointsToday} points today! Nice work! 🌟`,
      `${currentStreak} day streak! You're doing awesome! 👍`,
      `More than halfway there! Keep up the good work! 💫`,
      `${totalPointsToday} points today! You're making progress! 🎯`
    ];
  }
  // Encouraging messages for lower performance
  else {
    mood = 'encouraging';
    animation = 'normal';
    messages = [
      `Every journey starts with a single step! You've got this! 💪`,
      `Don't give up! Each task completed is progress! 🌱`,
      `You can do it! Start with one small task! 🎯`,
      `Believe in yourself! Every effort counts! ⭐`,
      `Take it one step at a time! You're capable of amazing things! 🌟`
    ];
  }

  // Add time-specific messages
  if (timeOfDay === 'morning') {
    messages.push(`Good morning! Start your day strong! ☀️`);
  } else if (timeOfDay === 'evening') {
    messages.push(`Great ${timeOfDay}! Finish strong today! 🌙`);
  }

  // Streak-specific messages
  if (currentStreak >= 7) {
    messages.push(`${currentStreak} days in a row! You're a champion! 🏆`);
  } else if (currentStreak >= 3) {
    messages.push(`${currentStreak} day streak! Keep it going! 🔥`);
  }

  // Random selection
  const selectedMessage = messages[Math.floor(Math.random() * messages.length)];

  return { message: selectedMessage, mood, animation };
};

exports.generateMessage = async (req, res) => {
  try {
    const {
      taskCompletionRate = 0,
      totalPointsToday = 0,
      studyTimeHours = 0,
      currentStreak = 0,
      timeOfDay = 'afternoon',
      ageGroup = 10
    } = req.body;

    const result = generateSmartMessage({
      taskCompletionRate,
      totalPointsToday,
      currentStreak,
      timeOfDay,
      ageGroup
    });

    res.json(result);

  } catch (error) {
    console.error('Error generating message:', error);
    res.json({
      message: 'Keep up the great work! You\'re doing amazing! 🌟',
      mood: 'happy',
      animation: 'normal'
    });
  }
};