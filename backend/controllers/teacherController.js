const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Course = require('../models/Course');
const Student = require('../models/Student');
const { logAudit } = require('../middleware/auditLogger');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private (Admin, Teacher)
exports.getTeachers = async (req, res, next) => {
  try {
    const { department, search, status } = req.query;
    const query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { employeeId: searchRegex },
        { email: searchRegex },
        { department: searchRegex },
      ];
    }

    if (department) query.department = new RegExp(department, 'i');
    if (status) query.status = status;

    const teachers = await Teacher.find(query)
      .populate('assignedCourses', 'name code department duration')
      .populate('user', 'email role avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teachers.length,
      teachers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single teacher details & assigned courses/students
// @route   GET /api/teachers/:id
// @access  Private
exports.getTeacherById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('assignedCourses')
      .populate('user', 'name email role avatar');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    // Find all students in courses assigned to this teacher
    const courseIds = teacher.assignedCourses.map((c) => c._id);
    const assignedStudents = await Student.find({ course: { $in: courseIds } })
      .populate('course', 'name code')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: {
        teacher,
        assignedStudentsCount: assignedStudents.length,
        assignedStudents,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new teacher record
// @route   POST /api/teachers
// @access  Private (Admin)
exports.createTeacher = async (req, res, next) => {
  try {
    const {
      employeeId,
      name,
      email,
      phone,
      department,
      designation,
      qualification,
      subjects,
      assignedCourses,
      avatar,
      createUserAccount = true,
      password,
    } = req.body;

    if (createUserAccount && !password) {
      return res.status(400).json({
        success: false,
        message: 'A password is required when creating a teacher login account.',
      });
    }

    const existingEmp = await Teacher.findOne({ employeeId: employeeId.toUpperCase() });
    if (existingEmp) {
      return res.status(400).json({
        success: false,
        message: `Teacher with Employee ID ${employeeId} already exists.`,
      });
    }

    let linkedUser = null;
    if (createUserAccount) {
      linkedUser = await User.findOne({ email: email.toLowerCase() });
      if (!linkedUser) {
        linkedUser = await User.create({
          name,
          email: email.toLowerCase(),
          password,
          role: 'teacher',
          phone,
          avatar,
        });
      }
    }

    const teacher = await Teacher.create({
      employeeId: employeeId.toUpperCase(),
      user: linkedUser ? linkedUser._id : undefined,
      name,
      email: email.toLowerCase(),
      phone,
      department,
      designation: designation || 'Lecturer',
      qualification: qualification || 'Master Degree',
      subjects: subjects || [],
      assignedCourses: assignedCourses || [],
      avatar,
    });

    // Update the courses with assignedTeacher
    if (assignedCourses && assignedCourses.length > 0) {
      await Course.updateMany(
        { _id: { $in: assignedCourses } },
        { assignedTeacher: teacher._id }
      );
    }

    await logAudit({
      action: 'CREATE_TEACHER',
      module: 'TEACHER',
      details: `Created teacher record ${teacher.name} (${teacher.employeeId})`,
      user: req.user,
      targetId: teacher._id,
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private (Admin)
exports.updateTeacher = async (req, res, next) => {
  try {
    let teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('assignedCourses');

    if (req.body.assignedCourses) {
      await Course.updateMany(
        { assignedTeacher: teacher._id },
        { $unset: { assignedTeacher: '' } }
      );
      await Course.updateMany(
        { _id: { $in: req.body.assignedCourses } },
        { assignedTeacher: teacher._id }
      );
    }

    await logAudit({
      action: 'UPDATE_TEACHER',
      module: 'TEACHER',
      details: `Updated teacher record ${teacher.name} (${teacher.employeeId})`,
      user: req.user,
      targetId: teacher._id,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admin)
exports.deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    if (teacher.user) {
      await User.findByIdAndDelete(teacher.user);
    }

    // Unassign courses
    await Course.updateMany(
      { assignedTeacher: teacher._id },
      { $unset: { assignedTeacher: '' } }
    );

    await teacher.deleteOne();

    await logAudit({
      action: 'DELETE_TEACHER',
      module: 'TEACHER',
      details: `Deleted teacher record ${teacher.name}`,
      user: req.user,
      targetId: teacher._id,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
