const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exam name is required'],
    trim: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required'],
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  examDate: {
    type: Date,
    required: [true, 'Exam date is required'],
  },
  maxMarks: {
    type: Number,
    required: [true, 'Maximum marks is required'],
    default: 100,
  },
  passMarks: {
    type: Number,
    required: [true, 'Passing marks is required'],
    default: 40,
  },
  term: {
    type: String,
    default: 'Semester 1',
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Exam', examSchema);
