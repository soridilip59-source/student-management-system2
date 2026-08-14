const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Course = require('../models/Course');
const { Parser } = require('json2csv');

// @desc    Export students list as CSV
// @route   GET /api/reports/students/csv
// @access  Private (Admin, Teacher)
exports.exportStudentsCSV = async (req, res, next) => {
  try {
    const { course, department, status } = req.query;
    const query = {};
    if (course) query.course = course;
    if (department) query.department = department;
    if (status) query.status = status;

    const students = await Student.find(query).populate('course', 'name code');

    const fields = [
      { label: 'Student ID', value: 'studentId' },
      { label: 'Full Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Phone', value: 'phone' },
      { label: 'Gender', value: 'gender' },
      { label: 'Department', value: 'department' },
      { label: 'Course', value: 'course.name' },
      { label: 'Status', value: 'status' },
      { label: 'Admission Date', value: (row) => new Date(row.admissionDate).toLocaleDateString() },
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(students);

    res.header('Content-Type', 'text/csv');
    res.attachment(`students_export_${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Export attendance records as CSV
// @route   GET /api/reports/attendance/csv
// @access  Private (Admin, Teacher)
exports.exportAttendanceCSV = async (req, res, next) => {
  try {
    const { course, startDate, endDate } = req.query;
    const query = {};
    if (course) query.course = course;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const records = await Attendance.find(query)
      .populate('student', 'name studentId email')
      .populate('course', 'name code');

    const fields = [
      { label: 'Date', value: (row) => new Date(row.date).toLocaleDateString() },
      { label: 'Student ID', value: 'student.studentId' },
      { label: 'Student Name', value: 'student.name' },
      { label: 'Course', value: 'course.name' },
      { label: 'Status', value: 'status' },
      { label: 'Remarks', value: 'remarks' },
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(records);

    res.header('Content-Type', 'text/csv');
    res.attachment(`attendance_export_${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Export marks ledger as CSV
// @route   GET /api/reports/marks/csv
// @access  Private (Admin, Teacher)
exports.exportMarksCSV = async (req, res, next) => {
  try {
    const { exam, course } = req.query;
    const query = {};
    if (exam) query.exam = exam;

    const marks = await Marks.find(query)
      .populate('student', 'name studentId department')
      .populate('exam', 'name term maxMarks');

    const fields = [
      { label: 'Student ID', value: 'student.studentId' },
      { label: 'Student Name', value: 'student.name' },
      { label: 'Department', value: 'student.department' },
      { label: 'Exam', value: 'exam.name' },
      { label: 'Subject', value: 'subject' },
      { label: 'Marks Obtained', value: 'marksObtained' },
      { label: 'Max Marks', value: 'maxMarks' },
      { label: 'Percentage (%)', value: 'percentage' },
      { label: 'Grade', value: 'grade' },
      { label: 'Result', value: 'result' },
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(marks);

    res.header('Content-Type', 'text/csv');
    res.attachment(`marks_export_${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};
