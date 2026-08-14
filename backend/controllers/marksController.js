const Marks = require('../models/Marks');
const Exam = require('../models/Exam');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { logAudit } = require('../middleware/auditLogger');
const { calculateGrade } = require('../utils/gradeCalculator');

// @desc    Get marks with filter (exam, student, subject)
// @route   GET /api/marks
// @access  Private
exports.getMarks = async (req, res, next) => {
  try {
    const { exam, student, subject } = req.query;
    const query = {};

    if (exam) query.exam = exam;
    if (subject) query.subject = new RegExp(subject, 'i');

    // Role check: Student can only view their own marks
    if (req.user.role === 'student') {
      const studentDoc = await Student.findOne({ user: req.user._id });
      if (!studentDoc) {
        return res.status(200).json({ success: true, marks: [] });
      }
      query.student = studentDoc._id;
    } else if (student) {
      query.student = student;
    }

    const marks = await Marks.find(query)
      .populate('student', 'name studentId email department avatar')
      .populate({
        path: 'exam',
        populate: { path: 'course', select: 'name code' },
      })
      .populate('enteredBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: marks.length,
      marks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enter or update marks for a single student
// @route   POST /api/marks
// @access  Private (Teacher, Admin)
exports.enterMarks = async (req, res, next) => {
  try {
    const { student, exam, subject, marksObtained, maxMarks, remarks } = req.body;

    const examDoc = await Exam.findById(exam);
    if (!examDoc) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const effectiveMaxMarks = maxMarks || examDoc.maxMarks || 100;
    const effectiveSubject = subject || examDoc.subject;

    let markRecord = await Marks.findOne({ student, exam });

    if (markRecord) {
      markRecord.marksObtained = marksObtained;
      markRecord.maxMarks = effectiveMaxMarks;
      markRecord.subject = effectiveSubject;
      markRecord.remarks = remarks || markRecord.remarks;
      markRecord.enteredBy = req.user._id;
      await markRecord.save();
    } else {
      markRecord = await Marks.create({
        student,
        exam,
        subject: effectiveSubject,
        marksObtained,
        maxMarks: effectiveMaxMarks,
        remarks: remarks || '',
        enteredBy: req.user._id,
      });
    }

    // Send notification to the student
    const studentDoc = await Student.findById(student);
    if (studentDoc && studentDoc.user) {
      await Notification.create({
        recipient: studentDoc.user,
        title: `Exam Result Published: ${examDoc.name}`,
        message: `Your score for ${effectiveSubject} is ${marksObtained}/${effectiveMaxMarks} (Grade: ${markRecord.grade}).`,
        type: 'exam',
      });
    }

    await logAudit({
      action: 'ENTER_MARKS',
      module: 'MARKS',
      details: `Entered marks for student ${studentDoc ? studentDoc.name : student} in ${effectiveSubject}: ${marksObtained}/${effectiveMaxMarks}`,
      user: req.user,
      targetId: markRecord._id,
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Marks recorded successfully',
      data: markRecord,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk enter/update marks for an exam
// @route   POST /api/marks/bulk
// @access  Private (Teacher, Admin)
exports.bulkEnterMarks = async (req, res, next) => {
  try {
    const { examId, records } = req.body; // records: [{ studentId, marksObtained, remarks }]

    if (!examId || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide examId and array of student marks records.',
      });
    }

    const examDoc = await Exam.findById(examId);
    if (!examDoc) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const savedMarks = [];
    for (const record of records) {
      const percentage = parseFloat(((record.marksObtained / examDoc.maxMarks) * 100).toFixed(2));
      const { grade, result } = calculateGrade(percentage);

      const updated = await Marks.findOneAndUpdate(
        { student: record.studentId, exam: examId },
        {
          student: record.studentId,
          exam: examId,
          subject: examDoc.subject,
          marksObtained: Number(record.marksObtained),
          maxMarks: examDoc.maxMarks,
          percentage,
          grade,
          result,
          remarks: record.remarks || '',
          enteredBy: req.user._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      savedMarks.push(updated);
    }

    await logAudit({
      action: 'BULK_ENTER_MARKS',
      module: 'MARKS',
      details: `Bulk entered marks for ${records.length} students in ${examDoc.name} (${examDoc.subject})`,
      user: req.user,
      targetId: examId,
      req,
    });

    res.status(200).json({
      success: true,
      message: `Marks recorded successfully for ${savedMarks.length} students.`,
      data: savedMarks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete report card / academic transcript for a student
// @route   GET /api/marks/report-card/:studentId
// @access  Private
exports.getStudentReportCard = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.studentId)
      .populate('course')
      .populate('user', 'name email');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const marksRecords = await Marks.find({ student: student._id })
      .populate('exam')
      .sort({ createdAt: -1 });

    let totalMarks = 0;
    let totalMaxMarks = 0;
    let subjectMap = {};

    marksRecords.forEach((m) => {
      totalMarks += m.marksObtained;
      totalMaxMarks += m.maxMarks;

      if (!subjectMap[m.subject]) {
        subjectMap[m.subject] = {
          subject: m.subject,
          marksObtained: m.marksObtained,
          maxMarks: m.maxMarks,
          percentage: m.percentage,
          grade: m.grade,
          result: m.result,
        };
      }
    });

    const overallPercentage = totalMaxMarks > 0 ? parseFloat(((totalMarks / totalMaxMarks) * 100).toFixed(2)) : 0;
    const { grade: overallGrade, result: overallResult, gpa } = calculateGrade(overallPercentage);

    res.status(200).json({
      success: true,
      data: {
        student: {
          _id: student._id,
          studentId: student.studentId,
          name: student.name,
          email: student.email,
          course: student.course ? student.course.name : 'N/A',
          courseCode: student.course ? student.course.code : 'N/A',
          department: student.department,
          admissionDate: student.admissionDate,
        },
        summary: {
          totalMarksObtained: totalMarks,
          totalMaxMarks,
          overallPercentage,
          overallGrade,
          overallResult,
          gpa,
          totalSubjects: Object.keys(subjectMap).length,
        },
        subjects: Object.values(subjectMap),
        allMarks: marksRecords,
      },
    });
  } catch (error) {
    next(error);
  }
};
