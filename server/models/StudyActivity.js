const mongoose = require('mongoose');

const studyActivitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'pending_approval'],
    default: 'pending'
  },
  dueDate: Date,
  duration: Number,
  proofImage: {
    type: String,
    default: null
  },
  proofImageName: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.StudyActivity || mongoose.model('StudyActivity', studyActivitySchema);