const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { logAudit } = require('../middleware/auditLogger');
const { calculateAttendancePercentage } = require('../utils/gradeCalculator');

// @desc    Get attendance records with filtering
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res, next) => {
  try {
    const { course, date, student, startDate, endDate } = req.query;
    const query = {};

    if (course) query.course = course;
    if (student) query.student = student;

    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    // Role check: If logged in as student, only fetch their own attendance
    if (req.user.role === 'student') {
      const studentDoc = await Student.findOne({ user: req.user._id });
      if (!studentDoc) {
        return res.status(200).json({ success: true, attendance: [], stats: { percentage: 0 } });
      }
      query.student = studentDoc._id;
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('student', 'name studentId email avatar department')
      .populate('course', 'name code')
      .populate('markedBy', 'name role')
      .sort({ date: -1 });

    // Calculate summary statistics
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter((a) => a.status === 'Present').length;
    const late = attendanceRecords.filter((a) => a.status === 'Late').length;
    const absent = attendanceRecords.filter((a) => a.status === 'Absent').length;
    const leave = attendanceRecords.filter((a) => a.status === 'Leave').length;

    // Effective present includes Present and Late
    const effectivePresent = present + late;
    const percentage = calculateAttendancePercentage(effectivePresent, total);

    res.status(200).json({
      success: true,
      count: total,
      stats: {
        total,
        present,
        late,
        absent,
        leave,
        percentage,
      },
      attendance: attendanceRecords,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk mark attendance for an entire class/course on a specific date
// @route   POST /api/attendance/bulk
// @access  Private (Teacher, Admin)
exports.bulkMarkAttendance = async (req, res, next) => {
  try {
    const { courseId, date, records } = req.body; // records: [{ studentId, status, remarks }]

    if (!courseId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide courseId, date, and array of student attendance records.',
      });
    }

    const attendanceDate = new Date(date);
    const startOfDay = new Date(new Date(attendanceDate).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(attendanceDate).setHours(23, 59, 59, 999));

    const bulkOperations = records.map((record) => {
      return {
        updateOne: {
          filter: {
            student: record.studentId,
            course: courseId,
            date: { $gte: startOfDay, $lte: endOfDay },
          },
          update: {
            $set: {
              student: record.studentId,
              course: courseId,
              date: attendanceDate,
              status: record.status || 'Present',
              remarks: record.remarks || '',
              markedBy: req.user._id,
            },
          },
          upsert: true,
        },
      };
    });

    await Attendance.bulkWrite(bulkOperations);

    // Audit log
    const courseDoc = await Course.findById(courseId);
    await logAudit({
      action: 'BULK_MARK_ATTENDANCE',
      module: 'ATTENDANCE',
      details: `Marked attendance for ${records.length} students in ${courseDoc ? courseDoc.name : courseId} on ${date}`,
      user: req.user,
      targetId: courseId,
      req,
    });

    // Check for low attendance warning (< 75%) and generate notification if needed
    for (const record of records) {
      if (record.status === 'Absent') {
        const studentRecords = await Attendance.find({ student: record.studentId });
        const sTotal = studentRecords.length;
        const sPresent = studentRecords.filter((r) => r.status === 'Present' || r.status === 'Late').length;
        const pct = calculateAttendancePercentage(sPresent, sTotal);
        if (pct < 75 && sTotal >= 4) {
          const sObj = await Student.findById(record.studentId);
          if (sObj && sObj.user) {
            await Notification.create({
              recipient: sObj.user,
              title: 'Low Attendance Alert',
              message: `Your current attendance is ${pct}%, which is below the required 75% threshold.`,
              type: 'warning',
            });
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Attendance marked successfully for ${records.length} students.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single student attendance
// @route   POST /api/attendance
// @access  Private (Teacher, Admin)
exports.markAttendance = async (req, res, next) => {
  try {
    const { student, course, date, status, remarks } = req.body;

    const attendanceDate = new Date(date || Date.now());
    const startOfDay = new Date(new Date(attendanceDate).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(attendanceDate).setHours(23, 59, 59, 999));

    let attendance = await Attendance.findOne({
      student,
      course,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (attendance) {
      attendance.status = status;
      attendance.remarks = remarks || attendance.remarks;
      attendance.markedBy = req.user._id;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        student,
        course,
        date: attendanceDate,
        status: status || 'Present',
        remarks: remarks || '',
        markedBy: req.user._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Attendance saved successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance by ID
// @route   PUT /api/attendance/:id
// @access  Private (Teacher, Admin)
exports.updateAttendance = async (req, res, next) => {
  try {
    let record = await Attendance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    record = await Attendance.findByIdAndUpdate(
      req.params.id,
      { ...req.body, markedBy: req.user._id },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student overall attendance analytics
// @route   GET /api/attendance/student/:studentId
// @access  Private
exports.getStudentAttendanceStats = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.studentId).populate('course');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const records = await Attendance.find({ student: student._id }).sort({ date: -1 });
    const total = records.length;
    const present = records.filter((r) => r.status === 'Present').length;
    const late = records.filter((r) => r.status === 'Late').length;
    const absent = records.filter((r) => r.status === 'Absent').length;
    const leave = records.filter((r) => r.status === 'Leave').length;
    const percentage = calculateAttendancePercentage(present + late, total);

    // Group by month for chart trends
    const monthlyMap = {};
    records.forEach((rec) => {
      const monthYear = new Date(rec.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = { month: monthYear, total: 0, present: 0 };
      }
      monthlyMap[monthYear].total += 1;
      if (rec.status === 'Present' || rec.status === 'Late') {
        monthlyMap[monthYear].present += 1;
      }
    });

    const monthlyTrends = Object.values(monthlyMap).map((m) => ({
      ...m,
      percentage: calculateAttendancePercentage(m.present, m.total),
    }));

    res.status(200).json({
      success: true,
      data: {
        student: { _id: student._id, name: student.name, studentId: student.studentId },
        summary: { total, present, late, absent, leave, percentage },
        monthlyTrends,
        recentRecords: records.slice(0, 15),
      },
    });
  } catch (error) {
    next(error);
  }
};
