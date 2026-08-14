const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required'],
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: [true, 'Exam is required'],
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
  },
  marksObtained: {
    type: Number,
    required: [true, 'Marks obtained is required'],
    min: 0,
  },
  maxMarks: {
    type: Number,
    required: true,
    default: 100,
  },
  percentage: {
    type: Number,
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C', 'D', 'F'],
  },
  result: {
    type: String,
    enum: ['Pass', 'Fail'],
  },
  enteredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  remarks: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Auto calculate percentage, grade, and pass/fail before saving
marksSchema.pre('save', function (next) {
  if (this.maxMarks > 0) {
    this.percentage = parseFloat(((this.marksObtained / this.maxMarks) * 100).toFixed(2));
    
    // PRD Grading logic:
    // 90–100 -> A+
    // 80–89  -> A
    // 70–79  -> B+
    // 60–69  -> B
    // 50–59  -> C
    // 40–49  -> D
    // <40    -> F
    if (this.percentage >= 90) {
      this.grade = 'A+';
    } else if (this.percentage >= 80) {
      this.grade = 'A';
    } else if (this.percentage >= 70) {
      this.grade = 'B+';
    } else if (this.percentage >= 60) {
      this.grade = 'B';
    } else if (this.percentage >= 50) {
      this.grade = 'C';
    } else if (this.percentage >= 40) {
      this.grade = 'D';
    } else {
      this.grade = 'F';
    }

    this.result = this.percentage >= 40 ? 'Pass' : 'Fail';
  }
  next();
});

marksSchema.index({ student: 1, exam: 1 }, { unique: true });

module.exports = mongoose.model('Marks', marksSchema);
