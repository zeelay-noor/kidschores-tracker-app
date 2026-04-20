const Chore = require('../models/Chore');
const User = require('../models/User');
const Reward = require('../models/Reward');

// AI Task Suggestion Engine
const generateTaskSuggestions = (child, completedTasks, rewards) => {
  const age = child.age || 12;
  const interests = child.interests || [];
  const performanceLevel = rewards ? Math.floor(rewards.totalPoints / 100) : 0;

  // Task database categorized by age and difficulty
  const taskDatabase = {
    easy: [
      { title: 'Make your bed', category: 'bedroom', points: 10, age: [5, 18] },
      { title: 'Put dirty clothes in hamper', category: 'bedroom', points: 5, age: [5, 18] },
      { title: 'Water the plants', category: 'outdoor', points: 15, age: [6, 18] },
      { title: 'Feed the pet', category: 'pets', points: 10, age: [6, 18] },
      { title: 'Set the dinner table', category: 'kitchen', points: 10, age: [6, 18] },
      { title: 'Clear your plate after eating', category: 'kitchen', points: 5, age: [5, 18] },
      { title: 'Organize your school bag', category: 'school', points: 10, age: [6, 18] },
      { title: 'Put away your toys', category: 'bedroom', points: 10, age: [5, 12] },
    ],
    medium: [
      { title: 'Wash the dishes', category: 'kitchen', points: 20, age: [8, 18] },
      { title: 'Vacuum your room', category: 'bedroom', points: 25, age: [9, 18] },
      { title: 'Take out the trash', category: 'outdoor', points: 15, age: [8, 18] },
      { title: 'Help with laundry', category: 'laundry', points: 30, age: [10, 18] },
      { title: 'Clean the bathroom sink', category: 'bathroom', points: 20, age: [9, 18] },
      { title: 'Sweep the kitchen floor', category: 'kitchen', points: 20, age: [8, 18] },
      { title: 'Organize the bookshelf', category: 'bedroom', points: 25, age: [8, 18] },
      { title: 'Help prepare simple meals', category: 'kitchen', points: 30, age: [10, 18] },
    ],
    hard: [
      { title: 'Clean the entire bathroom', category: 'bathroom', points: 40, age: [12, 18] },
      { title: 'Mow the lawn', category: 'outdoor', points: 50, age: [12, 18] },
      { title: 'Wash the car', category: 'outdoor', points: 40, age: [11, 18] },
      { title: 'Deep clean your room', category: 'bedroom', points: 45, age: [10, 18] },
      { title: 'Cook a full meal', category: 'kitchen', points: 60, age: [13, 18] },
      { title: 'Do all the laundry', category: 'laundry', points: 50, age: [12, 18] },
      { title: 'Organize the garage', category: 'outdoor', points: 55, age: [12, 18] },
    ]
  };

  // Filter tasks by age
  const filterByAge = (tasks) => tasks.filter(task => age >= task.age[0] && age <= task.age[1]);

  const easyTasks = filterByAge(taskDatabase.easy);
  const mediumTasks = filterByAge(taskDatabase.medium);
  const hardTasks = filterByAge(taskDatabase.hard);

  // Get completed task titles to avoid duplicates
  const completedTitles = completedTasks.map(t => t.title.toLowerCase());

  // Smart selection based on performance level
  let suggestions = [];

  if (performanceLevel < 2) {
    // Beginner: mostly easy tasks
    suggestions = [
      ...easyTasks.filter(t => !completedTitles.includes(t.title.toLowerCase())).slice(0, 4),
      ...mediumTasks.filter(t => !completedTitles.includes(t.title.toLowerCase())).slice(0, 1)
    ];
  } else if (performanceLevel < 5) {
    // Intermediate: mix of easy and medium
    suggestions = [
      ...easyTasks.filter(t => !completedTitles.includes(t.title.toLowerCase())).slice(0, 2),
      ...mediumTasks.filter(t => !completedTitles.includes(t.title.toLowerCase())).slice(0, 3)
    ];
  } else {
    // Advanced: mostly medium and hard
    suggestions = [
      ...mediumTasks.filter(t => !completedTitles.includes(t.title.toLowerCase())).slice(0, 2),
      ...hardTasks.filter(t => !completedTitles.includes(t.title.toLowerCase())).slice(0, 3)
    ];
  }

  // Add metadata
  suggestions = suggestions.map(task => ({
    ...task,
    reason: getReasonForSuggestion(task, age, performanceLevel, interests),
    difficulty: getDifficulty(task.points)
  }));

  return suggestions.slice(0, 5); // Return top 5
};

const getReasonForSuggestion = (task, age, level, interests) => {
  const reasons = [
    `Perfect for your age (${age} years)`,
    `Matches your skill level`,
    `Great way to earn ${task.points} points`,
    `Helps develop responsibility`,
    `Quick and easy task`,
    `Challenge yourself!`
  ];

  if (task.points >= 40) {
    return `High reward task! Earn ${task.points} points`;
  } else if (level < 2 && task.points <= 15) {
    return `Great starter task for beginners`;
  } else if (level >= 5 && task.points >= 30) {
    return `Advanced task - you're ready for this!`;
  }

  return reasons[Math.floor(Math.random() * reasons.length)];
};

const getDifficulty = (points) => {
  if (points <= 15) return 'Easy';
  if (points <= 35) return 'Medium';
  return 'Hard';
};

// Get AI suggestions for a child
exports.getSuggestions = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    let childId = userId;

    // If parent is requesting, get childId from query
    if (userRole === 'parent') {
      childId = req.query.childId;
      if (!childId) {
        return res.status(400).json({ message: 'Child ID required for parent' });
      }
    }

    // Get child data
    const child = await User.findById(childId);
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    // Get child's completed tasks (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completedTasks = await Chore.find({
      assignedTo: childId,
      status: 'completed',
      completedAt: { $gte: thirtyDaysAgo }
    });

    // Get child's rewards
    const rewards = await Reward.findOne({ userId: childId });

    // Generate suggestions
    const suggestions = generateTaskSuggestions(child, completedTasks, rewards);

    res.json({
      suggestions,
      childName: child.name,
      performanceLevel: rewards ? Math.floor(rewards.totalPoints / 100) : 0,
      totalPoints: rewards ? rewards.totalPoints : 0
    });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ message: 'Error generating suggestions' });
  }
};

// Accept a suggestion and create task
exports.acceptSuggestion = async (req, res) => {
  try {
    const { suggestion, childId } = req.body;
    const parentId = req.userId;

    // Create the chore
    const chore = new Chore({
      title: suggestion.title,
      description: `AI suggested task - ${suggestion.reason}`,
      assignedTo: childId,
      createdBy: parentId,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      points: suggestion.points,
      status: 'pending'
    });

    await chore.save();

    res.json({ message: 'Task created from AI suggestion!', chore });
  } catch (error) {
    console.error('Error accepting suggestion:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
};