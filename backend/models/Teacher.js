const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    required: [true, 'Teacher name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    default: '',
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
  },
  designation: {
    type: String,
    default: 'Lecturer',
  },
  qualification: {
    type: String,
    default: 'M.Sc / Ph.D',
  },
  subjects: [{
    type: String,
    trim: true,
  }],
  assignedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  }],
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  avatar: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Resigned'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Teacher', teacherSchema);
