const StudyActivity = require('../models/StudyActivity');

// Create study activity
exports.createActivity = async (req, res) => {
  try {
    const { title, subject, description, assignedTo, duration, dueDate } = req.body;

    const activity = new StudyActivity({
      title,
      subject,
      description,
      assignedTo,
      createdBy: req.userId,
      duration,
      dueDate
    });

    await activity.save();
    res.status(201).json({ message: 'Study activity created successfully', activity });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all study activities
exports.getActivities = async (req, res) => {
  try {
    const activities = await StudyActivity.find()
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update activity status (with proof image)
exports.updateActivityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, proofImage, proofImageName } = req.body;

    const updateData = { status };
    
    if (proofImage && proofImageName) {
      updateData.proofImage = proofImage;
      updateData.proofImageName = proofImageName;
    }
    
    if (status === 'pending') {
      updateData.proofImage = null;
      updateData.proofImageName = null;
    }

    const activity = await StudyActivity.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json({ message: 'Activity updated successfully', activity });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete activity
exports.deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await StudyActivity.findByIdAndDelete(id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};