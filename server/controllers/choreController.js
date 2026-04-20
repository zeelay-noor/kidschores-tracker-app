const Chore = require('../models/Chore');

// Create chore
exports.createChore = async (req, res) => {
  try {
    const { title, description, assignedTo, points, dueDate } = req.body;

    const chore = new Chore({
      title,
      description,
      assignedTo,
      createdBy: req.userId,
      points,
      dueDate
    });

    await chore.save();
    res.status(201).json({ message: 'Chore created successfully', chore });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all chores
exports.getChores = async (req, res) => {
  try {
    const chores = await Chore.find()
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    res.json(chores);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update chore status (with proof image and points)
exports.updateChoreStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, proofImage, proofImageName } = req.body;

    const updateData = { status };
    
    if (proofImage && proofImageName) {
      updateData.proofImage = proofImage;
      updateData.proofImageName = proofImageName;
    }

    const chore = await Chore.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('assignedTo');

    if (!chore) {
      return res.status(404).json({ message: 'Chore not found' });
    }

    // Award points when parent approves (status changes to 'completed')
    if (status === 'completed' && chore.assignedTo) {
      const Reward = require('../models/Reward');
      
      let reward = await Reward.findOne({ userId: chore.assignedTo._id });
      
      if (!reward) {
        reward = new Reward({ userId: chore.assignedTo._id });
      }
      
      // Add points
      reward.totalPoints += chore.points;
      
      // Update level (every 100 points = 1 level)
      reward.level = Math.floor(reward.totalPoints / 100) + 1;
      
      // Award badges
      if (reward.totalPoints >= 50 && !reward.badges.find(b => b.name === 'First 50')) {
        reward.badges.push({ name: 'First 50', earnedAt: new Date() });
      }
      if (reward.totalPoints >= 100 && !reward.badges.find(b => b.name === 'Century')) {
        reward.badges.push({ name: 'Century', earnedAt: new Date() });
      }
      if (reward.totalPoints >= 200 && !reward.badges.find(b => b.name === 'Double Century')) {
        reward.badges.push({ name: 'Double Century', earnedAt: new Date() });
      }
      
      await reward.save();
    }

    res.json({ message: 'Chore updated successfully', chore });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete chore
exports.deleteChore = async (req, res) => {
  try {
    const { id } = req.params;

    const chore = await Chore.findByIdAndDelete(id);

    if (!chore) {
      return res.status(404).json({ message: 'Chore not found' });
    }

    res.json({ message: 'Chore deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};