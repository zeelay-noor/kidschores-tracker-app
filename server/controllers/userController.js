const User = require('../models/User');

// Get all children (for parent)
exports.getChildren = async (req, res) => {
  try {
    const children = await User.find({ parentId: req.userId, role: 'child' });
    res.json(children);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add child profile
exports.addChild = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const hashedPassword = await require('bcryptjs').hash(password, 10);
    
    const child = new User({
      name,
      email,
      password: hashedPassword,
      role: 'child',
      parentId: req.userId
    });
    
    await child.save();
    res.status(201).json({ message: 'Child added successfully', child });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete child
exports.deleteChild = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Child deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = exports;