const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'], // e.g. "3 Years", "4 Years", "6 Months"
  },
  description: {
    type: String,
    default: '',
  },
  assignedTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  subjects: [{
    code: String,
    name: String,
    credits: { type: Number, default: 3 },
  }],
  status: {
    type: String,
    enum: ['Active', 'Archived'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Course', courseSchema);
