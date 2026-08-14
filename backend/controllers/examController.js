const Exam = require('../models/Exam');
const Course = require('../models/Course');
const Marks = require('../models/Marks');
const Notification = require('../models/Notification');
const { logAudit } = require('../middleware/auditLogger');

// @desc    Get all exams with course info
// @route   GET /api/exams
// @access  Private
exports.getExams = async (req, res, next) => {
  try {
    const { course, subject, term, status } = req.query;
    const query = {};

    if (course) query.course = course;
    if (subject) query.subject = new RegExp(subject, 'i');
    if (term) query.term = term;
    if (status) query.status = status;

    const exams = await Exam.find(query)
      .populate('course', 'name code department')
      .sort({ examDate: -1 });

    // Attach count of marks submitted for each exam
    const examsWithMarksCount = await Promise.all(
      exams.map(async (exam) => {
        const marksCount = await Marks.countDocuments({ exam: exam._id });
        return {
          ...exam.toObject(),
          marksCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: examsWithMarksCount.length,
      exams: examsWithMarksCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single exam details
// @route   GET /api/exams/:id
// @access  Private
exports.getExamById = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('course');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    res.status(200).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new exam
// @route   POST /api/exams
// @access  Private (Admin, Teacher)
exports.createExam = async (req, res, next) => {
  try {
    const { name, course, subject, examDate, maxMarks, passMarks, term } = req.body;

    const exam = await Exam.create({
      name,
      course,
      subject,
      examDate,
      maxMarks: maxMarks || 100,
      passMarks: passMarks || 40,
      term: term || 'Semester 1',
    });

    const courseDoc = await Course.findById(course);

    // Broadcast notification for upcoming exam
    await Notification.create({
      recipientRole: 'all',
      title: `New Exam Scheduled: ${exam.name}`,
      message: `Exam for ${exam.subject} (${courseDoc ? courseDoc.name : ''}) has been scheduled for ${new Date(examDate).toLocaleDateString()}.`,
      type: 'exam',
    });

    await logAudit({
      action: 'CREATE_EXAM',
      module: 'EXAM',
      details: `Created exam ${exam.name} for subject ${exam.subject}`,
      user: req.user,
      targetId: exam._id,
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: exam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private (Admin, Teacher)
exports.updateExam = async (req, res, next) => {
  try {
    let exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Exam updated successfully',
      data: exam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private (Admin)
exports.deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    await Marks.deleteMany({ exam: exam._id });
    await exam.deleteOne();

    await logAudit({
      action: 'DELETE_EXAM',
      module: 'EXAM',
      details: `Deleted exam ${exam.name}`,
      user: req.user,
      targetId: exam._id,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Exam and associated marks deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
