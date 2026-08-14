const Student = require('../models/Student');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const { logAudit } = require('../middleware/auditLogger');
const { calculateGrade, calculateAttendancePercentage } = require('../utils/gradeCalculator');

// @desc    Get all students with search, filter, and pagination
// @route   GET /api/students
// @access  Private (Admin, Teacher)
exports.getStudents = async (req, res, next) => {
  try {
    const {
      search,
      course,
      department,
      status,
      gender,
      admissionYear,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // 1. Live Search by student name, ID, email, phone
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { studentId: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { department: searchRegex },
      ];
    }

    // 2. Filters
    if (course) query.course = course;
    if (department) query.department = new RegExp(department, 'i');
    if (status) query.status = status;
    if (gender) query.gender = gender;
    if (admissionYear) {
      const startDate = new Date(`${admissionYear}-01-01`);
      const endDate = new Date(`${admissionYear}-12-31`);
      query.admissionDate = { $gte: startDate, $lte: endDate };
    }

    // 3. Pagination calculations
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Student.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const students = await Student.find(query)
      .populate('course', 'name code department duration')
      .populate('user', 'email role avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      students,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student details with academic & attendance stats
// @route   GET /api/students/:id
// @access  Private (Admin, Teacher, Enrolled Student)
exports.getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('course')
      .populate('user', 'name email role avatar');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found with specified ID',
      });
    }

    // Role check: If student user, ensure they only view their own profile
    if (req.user.role === 'student' && student.user && student.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. You may only view your own student record.',
      });
    }

    // Fetch Attendance records & compute percentage
    const attendanceRecords = await Attendance.find({ student: student._id }).sort({ date: -1 });
    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    const attendancePercentage = calculateAttendancePercentage(presentCount, totalAttendance);

    // Fetch Marks records & compute overall academic percentage
    const marksRecords = await Marks.find({ student: student._id })
      .populate('exam', 'name term examDate maxMarks')
      .sort({ createdAt: -1 });

    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    marksRecords.forEach((m) => {
      totalMarksObtained += m.marksObtained;
      totalMaxMarks += m.maxMarks;
    });

    const overallPercentage = totalMaxMarks > 0 ? parseFloat(((totalMarksObtained / totalMaxMarks) * 100).toFixed(2)) : 0;
    const { grade: overallGrade, result: overallResult } = calculateGrade(overallPercentage);

    res.status(200).json({
      success: true,
      data: {
        student,
        academicStats: {
          attendancePercentage,
          totalClasses: totalAttendance,
          presentClasses: presentCount,
          absentClasses: attendanceRecords.filter((a) => a.status === 'Absent').length,
          overallPercentage,
          overallGrade,
          overallResult,
          totalExamsTaken: marksRecords.length,
        },
        recentAttendance: attendanceRecords.slice(0, 10),
        recentMarks: marksRecords,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new student record
// @route   POST /api/students
// @access  Private (Admin)
exports.createStudent = async (req, res, next) => {
  try {
    const {
      studentId,
      name,
      email,
      phone,
      dob,
      gender,
      address,
      course,
      department,
      admissionDate,
      status,
      avatar,
      guardian,
      createUserAccount = true,
      password,
    } = req.body;

    if (createUserAccount && !password) {
      return res.status(400).json({
        success: false,
        message: 'A password is required when creating a student login account.',
      });
    }

    // Check if studentId or email already exists
    const existingId = await Student.findOne({ studentId: studentId.toUpperCase() });
    if (existingId) {
      return res.status(400).json({
        success: false,
        message: `Student with ID ${studentId.toUpperCase()} already exists.`,
      });
    }

    const existingEmail = await Student.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `Student with email ${email} already exists.`,
      });
    }

    let linkedUser = null;
    if (createUserAccount) {
      // Create user login if not already registered
      linkedUser = await User.findOne({ email: email.toLowerCase() });
      if (!linkedUser) {
        linkedUser = await User.create({
          name,
          email: email.toLowerCase(),
          password,
          role: 'student',
          phone,
          avatar,
        });
      }
    }

    const student = await Student.create({
      studentId: studentId.toUpperCase(),
      user: linkedUser ? linkedUser._id : undefined,
      name,
      email: email.toLowerCase(),
      phone,
      dob,
      gender,
      address,
      course,
      department,
      admissionDate: admissionDate || Date.now(),
      status: status || 'Active',
      avatar,
      guardian,
    });

    await logAudit({
      action: 'CREATE_STUDENT',
      module: 'STUDENT',
      details: `Created student record ${student.name} (${student.studentId})`,
      user: req.user,
      targetId: student._id,
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private (Admin)
exports.updateStudent = async (req, res, next) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('course');

    // Also update linked user profile name/phone if changed
    if (student.user && (req.body.name || req.body.phone || req.body.avatar)) {
      await User.findByIdAndUpdate(student.user, {
        name: req.body.name || student.name,
        phone: req.body.phone || student.phone,
        avatar: req.body.avatar || student.avatar,
      });
    }

    await logAudit({
      action: 'UPDATE_STUDENT',
      module: 'STUDENT',
      details: `Updated student record ${student.name} (${student.studentId})`,
      user: req.user,
      targetId: student._id,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student record
// @route   DELETE /api/students/:id
// @access  Private (Admin)
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Delete attendance & marks associated with this student
    await Attendance.deleteMany({ student: student._id });
    await Marks.deleteMany({ student: student._id });
    if (student.user) {
      await User.findByIdAndDelete(student.user);
    }
    await student.deleteOne();

    await logAudit({
      action: 'DELETE_STUDENT',
      module: 'STUDENT',
      details: `Deleted student record ${student.name} (${student.studentId})`,
      user: req.user,
      targetId: student._id,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Student and associated academic records deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
