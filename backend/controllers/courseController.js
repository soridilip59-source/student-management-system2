const Course = require('../models/Course');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { logAudit } = require('../middleware/auditLogger');

// @desc    Get all courses with enrolled counts
// @route   GET /api/courses
// @access  Private (Admin, Teacher, Student)
exports.getCourses = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    const query = { status: 'Active' };

    if (department) query.department = new RegExp(department, 'i');
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ name: searchRegex }, { code: searchRegex }, { department: searchRegex }];
    }

    const courses = await Course.find(query)
      .populate('assignedTeacher', 'name employeeId email department')
      .sort({ createdAt: -1 });

    // Attach student enrollment count to each course
    const coursesWithCount = await Promise.all(
      courses.map(async (course) => {
        const enrolledCount = await Student.countDocuments({ course: course._id, status: 'Active' });
        return {
          ...course.toObject(),
          enrolledCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: coursesWithCount.length,
      courses: coursesWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course details and enrolled student roster
// @route   GET /api/courses/:id
// @access  Private
exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      'assignedTeacher',
      'name employeeId email department designation avatar'
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const enrolledStudents = await Student.find({ course: course._id }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: {
        course,
        enrolledStudentsCount: enrolledStudents.length,
        enrolledStudents,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Admin)
exports.createCourse = async (req, res, next) => {
  try {
    const { name, code, department, duration, description, assignedTeacher, subjects } = req.body;

    const existingCode = await Course.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: `Course with code ${code} already exists.`,
      });
    }

    const course = await Course.create({
      name,
      code: code.toUpperCase(),
      department,
      duration,
      description: description || '',
      assignedTeacher: assignedTeacher || null,
      subjects: subjects || [],
    });

    if (assignedTeacher) {
      await Teacher.findByIdAndUpdate(assignedTeacher, {
        $addToSet: { assignedCourses: course._id },
      });
    }

    await logAudit({
      action: 'CREATE_COURSE',
      module: 'COURSE',
      details: `Created course ${course.name} (${course.code})`,
      user: req.user,
      targetId: course._id,
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin)
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const oldTeacher = course.assignedTeacher;

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('assignedTeacher');

    // Update teacher assignedCourses references
    if (req.body.assignedTeacher && String(oldTeacher) !== String(req.body.assignedTeacher)) {
      if (oldTeacher) {
        await Teacher.findByIdAndUpdate(oldTeacher, { $pull: { assignedCourses: course._id } });
      }
      await Teacher.findByIdAndUpdate(req.body.assignedTeacher, { $addToSet: { assignedCourses: course._id } });
    }

    await logAudit({
      action: 'UPDATE_COURSE',
      module: 'COURSE',
      details: `Updated course ${course.name} (${course.code})`,
      user: req.user,
      targetId: course._id,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const enrolledStudents = await Student.countDocuments({ course: course._id });
    if (enrolledStudents > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete course with ${enrolledStudents} enrolled students. Reassign students first.`,
      });
    }

    if (course.assignedTeacher) {
      await Teacher.findByIdAndUpdate(course.assignedTeacher, {
        $pull: { assignedCourses: course._id },
      });
    }

    await course.deleteOne();

    await logAudit({
      action: 'DELETE_COURSE',
      module: 'COURSE',
      details: `Deleted course ${course.name} (${course.code})`,
      user: req.user,
      targetId: course._id,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
