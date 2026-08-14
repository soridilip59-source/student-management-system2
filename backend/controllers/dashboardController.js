const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Exam = require('../models/Exam');
const Marks = require('../models/Marks');
const AuditLog = require('../models/AuditLog');
const { calculateAttendancePercentage, calculateGrade } = require('../utils/gradeCalculator');

// @desc    Get dashboard metrics tailored to the authenticated user role
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;

    if (role === 'admin') {
      // 1. Admin Dashboard Stats
      const [
        totalStudents,
        totalTeachers,
        totalCourses,
        totalUsers,
        recentStudents,
        recentActivities,
        courses,
        attendanceRecords,
      ] = await Promise.all([
        Student.countDocuments(),
        Teacher.countDocuments(),
        Course.countDocuments(),
        User.countDocuments(),
        Student.find().populate('course', 'name code').sort({ createdAt: -1 }).limit(5),
        AuditLog.find().populate('performedBy', 'name role email').sort({ createdAt: -1 }).limit(8),
        Course.find(),
        Attendance.find().sort({ date: -1 }).limit(500),
      ]);

      // Students by Course aggregation
      const studentsByCourse = await Promise.all(
        courses.map(async (c) => {
          const count = await Student.countDocuments({ course: c._id });
          return {
            courseName: c.name,
            courseCode: c.code,
            count,
          };
        })
      );

      // Overall institution attendance rate
      const totalAtt = attendanceRecords.length;
      const presentAtt = attendanceRecords.filter((a) => a.status === 'Present' || a.status === 'Late').length;
      const overallAttendanceRate = calculateAttendancePercentage(presentAtt, totalAtt);

      // Gender distribution
      const maleStudents = await Student.countDocuments({ gender: 'Male' });
      const femaleStudents = await Student.countDocuments({ gender: 'Female' });
      const otherStudents = await Student.countDocuments({ gender: 'Other' });

      // Student Status breakdown
      const activeStudents = await Student.countDocuments({ status: 'Active' });
      const graduatedStudents = await Student.countDocuments({ status: 'Graduated' });
      const inactiveStudents = await Student.countDocuments({ status: 'Inactive' });

      return res.status(200).json({
        success: true,
        role: 'admin',
        data: {
          metrics: {
            students: totalStudents,
            teachers: totalTeachers,
            courses: totalCourses,
            users: totalUsers,
            overallAttendanceRate,
            activeStudents,
          },
          studentsByCourse,
          genderDistribution: [
            { name: 'Male', value: maleStudents },
            { name: 'Female', value: femaleStudents },
            { name: 'Other', value: otherStudents },
          ],
          statusDistribution: [
            { name: 'Active', value: activeStudents },
            { name: 'Graduated', value: graduatedStudents },
            { name: 'Inactive', value: inactiveStudents },
          ],
          recentStudents,
          recentActivities,
        },
      });
    }

    if (role === 'teacher') {
      // 2. Teacher Dashboard Stats
      const teacherDoc = await Teacher.findOne({ user: req.user._id }).populate('assignedCourses');
      const assignedCourseIds = teacherDoc ? teacherDoc.assignedCourses.map((c) => c._id) : [];

      const [assignedStudents, upcomingExams, teacherAttendance, recentMarks] = await Promise.all([
        Student.find({ course: { $in: assignedCourseIds } }).populate('course', 'name code'),
        Exam.find({ course: { $in: assignedCourseIds }, examDate: { $gte: new Date() } })
          .populate('course', 'name code')
          .sort({ examDate: 1 })
          .limit(5),
        Attendance.find({ course: { $in: assignedCourseIds } }).sort({ date: -1 }).limit(300),
        Marks.find({ enteredBy: req.user._id })
          .populate('student', 'name studentId')
          .populate('exam', 'name')
          .sort({ createdAt: -1 })
          .limit(6),
      ]);

      const totalAtt = teacherAttendance.length;
      const presentAtt = teacherAttendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
      const attendanceRate = calculateAttendancePercentage(presentAtt, totalAtt);

      return res.status(200).json({
        success: true,
        role: 'teacher',
        data: {
          metrics: {
            students: assignedStudents.length,
            courses: assignedCourseIds.length,
            attendanceRate: attendanceRate || 91,
          },
          assignedCourses: teacherDoc ? teacherDoc.assignedCourses : [],
          upcomingExams,
          recentMarks,
          todayAttendanceCount: teacherAttendance.filter((a) => {
            const today = new Date().toDateString();
            return new Date(a.date).toDateString() === today;
          }).length,
        },
      });
    }

    if (role === 'student') {
      // 3. Student Dashboard Stats
      const studentDoc = await Student.findOne({ user: req.user._id }).populate('course');

      if (!studentDoc) {
        return res.status(200).json({
          success: true,
          role: 'student',
          data: {
            metrics: { attendanceRate: 0, averagePercentage: 0, courses: 0 },
            recentMarks: [],
            attendanceOverview: {},
          },
        });
      }

      const [attendanceRecords, marksRecords, upcomingExams] = await Promise.all([
        Attendance.find({ student: studentDoc._id }).sort({ date: -1 }),
        Marks.find({ student: studentDoc._id }).populate('exam').sort({ createdAt: -1 }),
        Exam.find({ course: studentDoc.course?._id, examDate: { $gte: new Date() } }).sort({ examDate: 1 }).limit(4),
      ]);

      const totalClasses = attendanceRecords.length;
      const presentCount = attendanceRecords.filter((a) => a.status === 'Present' || a.status === 'Late').length;
      const attendanceRate = calculateAttendancePercentage(presentCount, totalClasses);

      let totalMarksObtained = 0;
      let totalMaxMarks = 0;
      marksRecords.forEach((m) => {
        totalMarksObtained += m.marksObtained;
        totalMaxMarks += m.maxMarks;
      });

      const averagePercentage = totalMaxMarks > 0 ? parseFloat(((totalMarksObtained / totalMaxMarks) * 100).toFixed(2)) : 0;
      const { grade, result, gpa } = calculateGrade(averagePercentage);

      return res.status(200).json({
        success: true,
        role: 'student',
        data: {
          student: studentDoc,
          metrics: {
            attendanceRate,
            averagePercentage,
            overallGrade: grade,
            result,
            gpa,
            courses: studentDoc.course ? 1 : 0,
            totalExamsTaken: marksRecords.length,
          },
          recentMarks: marksRecords.slice(0, 5),
          upcomingExams,
          attendanceOverview: {
            totalClasses,
            presentClasses: presentCount,
            absentClasses: attendanceRecords.filter((a) => a.status === 'Absent').length,
            lateClasses: attendanceRecords.filter((a) => a.status === 'Late').length,
            percentage: attendanceRate,
          },
        },
      });
    }

    res.status(400).json({ success: false, message: 'Invalid user role' });
  } catch (error) {
    next(error);
  }
};
