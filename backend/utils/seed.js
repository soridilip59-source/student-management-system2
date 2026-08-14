const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Exam = require('../models/Exam');
const Marks = require('../models/Marks');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { calculateGrade } = require('./gradeCalculator');

const seedDatabase = async () => {
  try {
    console.log('🌱 Checking / Seeding Initial Demo Data...');

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('⚡ Database already contains records. Skipping seed.');
      return;
    }

    console.log('🔄 Seeding default Admin, Faculty, Students, Courses, Attendance & Marks...');

    // 1. Create Core Users
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@sms.com',
      password: 'password123',
      role: 'admin',
      phone: '+1 555-0199',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    const teacherUser1 = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'teacher@sms.com',
      password: 'password123',
      role: 'teacher',
      phone: '+1 555-0142',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    });

    const teacherUser2 = await User.create({
      name: 'Prof. Alan Turing',
      email: 'prof.alan@sms.com',
      password: 'password123',
      role: 'teacher',
      phone: '+1 555-0188',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    });

    const studentUser1 = await User.create({
      name: 'Rahul Sharma',
      email: 'student@sms.com',
      password: 'password123',
      role: 'student',
      phone: '+1 555-0101',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    });

    const studentUser2 = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@sms.com',
      password: 'password123',
      role: 'student',
      phone: '+1 555-0102',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    });

    const studentUser3 = await User.create({
      name: 'Amit Verma',
      email: 'amit.verma@sms.com',
      password: 'password123',
      role: 'student',
      phone: '+1 555-0103',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    });

    const studentUser4 = await User.create({
      name: 'Neha Gupta',
      email: 'neha.gupta@sms.com',
      password: 'password123',
      role: 'student',
      phone: '+1 555-0104',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    });

    const studentUser5 = await User.create({
      name: 'Alex Johnson',
      email: 'alex.johnson@sms.com',
      password: 'password123',
      role: 'student',
      phone: '+1 555-0105',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    });

    // 2. Create Courses
    const course1 = await Course.create({
      name: 'Bachelor of Commerce (B.Com)',
      code: 'BCOM101',
      department: 'Commerce & Accounting',
      duration: '3 Years',
      description: 'Comprehensive undergraduate degree in Financial Accounting, Economics, Business Law, and Taxation.',
      subjects: [
        { code: 'ACC101', name: 'Financial Accounting', credits: 4 },
        { code: 'ECO102', name: 'Business Economics', credits: 3 },
        { code: 'BUS103', name: 'Business Management', credits: 4 },
        { code: 'STAT104', name: 'Business Statistics', credits: 3 },
      ],
    });

    const course2 = await Course.create({
      name: 'B.Tech in Computer Science',
      code: 'CS201',
      department: 'Computer Science & Engineering',
      duration: '4 Years',
      description: 'Foundations of algorithms, full-stack systems, databases, operating systems, and artificial intelligence.',
      subjects: [
        { code: 'CS101', name: 'Data Structures & Algorithms', credits: 4 },
        { code: 'CS102', name: 'Database Management Systems', credits: 4 },
        { code: 'CS103', name: 'Computer Networks', credits: 3 },
        { code: 'CS104', name: 'Web Development & Cloud', credits: 4 },
      ],
    });

    const course3 = await Course.create({
      name: 'Master of Business Administration (MBA)',
      code: 'MBA301',
      department: 'Management Studies',
      duration: '2 Years',
      description: 'Postgraduate management program covering strategic leadership, marketing analytics, and financial management.',
      subjects: [
        { code: 'MGT501', name: 'Strategic Management', credits: 4 },
        { code: 'MKT502', name: 'Marketing Strategy', credits: 3 },
        { code: 'FIN503', name: 'Corporate Finance', credits: 4 },
      ],
    });

    // 3. Create Teachers & Assign Courses
    const teacher1 = await Teacher.create({
      employeeId: 'EMP-1001',
      user: teacherUser1._id,
      name: 'Dr. Sarah Jenkins',
      email: 'teacher@sms.com',
      phone: '+1 555-0142',
      department: 'Commerce & Accounting',
      designation: 'Associate Professor & Dept Head',
      qualification: 'Ph.D. in Financial Economics (Oxford)',
      subjects: ['Financial Accounting', 'Business Economics', 'Business Statistics'],
      assignedCourses: [course1._id, course3._id],
      avatar: teacherUser1.avatar,
    });

    const teacher2 = await Teacher.create({
      employeeId: 'EMP-1002',
      user: teacherUser2._id,
      name: 'Prof. Alan Turing',
      email: 'prof.alan@sms.com',
      phone: '+1 555-0188',
      department: 'Computer Science & Engineering',
      designation: 'Senior Professor',
      qualification: 'Ph.D. in Computer Science (MIT)',
      subjects: ['Data Structures & Algorithms', 'Database Management Systems'],
      assignedCourses: [course2._id],
      avatar: teacherUser2.avatar,
    });

    // Update Courses with assigned teacher
    course1.assignedTeacher = teacher1._id;
    await course1.save();

    course2.assignedTeacher = teacher2._id;
    await course2.save();

    course3.assignedTeacher = teacher1._id;
    await course3.save();

    // 4. Create Students
    const student1 = await Student.create({
      studentId: 'STU-2026-001',
      user: studentUser1._id,
      name: 'Rahul Sharma',
      email: 'student@sms.com',
      phone: '+1 555-0101',
      dob: new Date('2004-05-15'),
      gender: 'Male',
      address: { street: '124 Maple Avenue', city: 'Metropolis', state: 'NY', zipCode: '10001' },
      course: course1._id,
      department: 'Commerce & Accounting',
      admissionDate: new Date('2023-08-01'),
      status: 'Active',
      avatar: studentUser1.avatar,
      guardian: { name: 'Rajesh Sharma', relationship: 'Father', phone: '+1 555-0111' },
    });

    const student2 = await Student.create({
      studentId: 'STU-2026-002',
      user: studentUser2._id,
      name: 'Priya Patel',
      email: 'priya.patel@sms.com',
      phone: '+1 555-0102',
      dob: new Date('2004-09-22'),
      gender: 'Female',
      address: { street: '78 Pine Road', city: 'Metropolis', state: 'NY', zipCode: '10002' },
      course: course1._id,
      department: 'Commerce & Accounting',
      admissionDate: new Date('2023-08-01'),
      status: 'Active',
      avatar: studentUser2.avatar,
      guardian: { name: 'Kavita Patel', relationship: 'Mother', phone: '+1 555-0112' },
    });

    const student3 = await Student.create({
      studentId: 'STU-2026-003',
      user: studentUser3._id,
      name: 'Amit Verma',
      email: 'amit.verma@sms.com',
      phone: '+1 555-0103',
      dob: new Date('2003-12-10'),
      gender: 'Male',
      address: { street: '45 Oak Lane', city: 'Metropolis', state: 'NY', zipCode: '10003' },
      course: course1._id,
      department: 'Commerce & Accounting',
      admissionDate: new Date('2023-08-01'),
      status: 'Active',
      avatar: studentUser3.avatar,
      guardian: { name: 'Sunil Verma', relationship: 'Father', phone: '+1 555-0113' },
    });

    const student4 = await Student.create({
      studentId: 'STU-2026-004',
      user: studentUser4._id,
      name: 'Neha Gupta',
      email: 'neha.gupta@sms.com',
      phone: '+1 555-0104',
      dob: new Date('2004-03-30'),
      gender: 'Female',
      address: { street: '12 Cedar Court', city: 'Metropolis', state: 'NY', zipCode: '10004' },
      course: course1._id,
      department: 'Commerce & Accounting',
      admissionDate: new Date('2023-08-01'),
      status: 'Active',
      avatar: studentUser4.avatar,
      guardian: { name: 'Meena Gupta', relationship: 'Mother', phone: '+1 555-0114' },
    });

    const student5 = await Student.create({
      studentId: 'STU-2026-005',
      user: studentUser5._id,
      name: 'Alex Johnson',
      email: 'alex.johnson@sms.com',
      phone: '+1 555-0105',
      dob: new Date('2003-07-18'),
      gender: 'Other',
      address: { street: '900 Broadway', city: 'Metropolis', state: 'NY', zipCode: '10005' },
      course: course2._id,
      department: 'Computer Science & Engineering',
      admissionDate: new Date('2023-08-01'),
      status: 'Active',
      avatar: studentUser5.avatar,
      guardian: { name: 'Robert Johnson', relationship: 'Father', phone: '+1 555-0115' },
    });

    // 5. Create Scheduled & Completed Exams
    const exam1 = await Exam.create({
      name: 'Mid-Term Examination 2026',
      course: course1._id,
      subject: 'Financial Accounting',
      examDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      maxMarks: 100,
      passMarks: 40,
      term: 'Semester 1',
      status: 'Completed',
    });

    const exam2 = await Exam.create({
      name: 'Mid-Term Examination 2026',
      course: course1._id,
      subject: 'Business Economics',
      examDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      maxMarks: 100,
      passMarks: 40,
      term: 'Semester 1',
      status: 'Completed',
    });

    const exam3 = await Exam.create({
      name: 'Mid-Term Examination 2026',
      course: course1._id,
      subject: 'Business Management',
      examDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      maxMarks: 100,
      passMarks: 40,
      term: 'Semester 1',
      status: 'Completed',
    });

    const exam4 = await Exam.create({
      name: 'Mid-Term Examination 2026',
      course: course1._id,
      subject: 'Business Statistics',
      examDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      maxMarks: 100,
      passMarks: 40,
      term: 'Semester 1',
      status: 'Completed',
    });

    const upcomingExam = await Exam.create({
      name: 'Final Semester Comprehensive Exam',
      course: course1._id,
      subject: 'Auditing & Taxation',
      examDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      maxMarks: 100,
      passMarks: 40,
      term: 'Semester 1',
      status: 'Scheduled',
    });

    // 6. Populate Marks for Rahul Sharma (STU-2026-001) matching PRD Example:
    // Accounting: 82, Economics: 76, Business: 89, Statistics: 91 -> Total 338 / 400 (84.5% - Grade A)
    const marksData = [
      { student: student1._id, exam: exam1._id, subject: 'Financial Accounting', marksObtained: 82, maxMarks: 100 },
      { student: student1._id, exam: exam2._id, subject: 'Business Economics', marksObtained: 76, maxMarks: 100 },
      { student: student1._id, exam: exam3._id, subject: 'Business Management', marksObtained: 89, maxMarks: 100 },
      { student: student1._id, exam: exam4._id, subject: 'Business Statistics', marksObtained: 91, maxMarks: 100 },

      // Priya Patel marks
      { student: student2._id, exam: exam1._id, subject: 'Financial Accounting', marksObtained: 94, maxMarks: 100 },
      { student: student2._id, exam: exam2._id, subject: 'Business Economics', marksObtained: 88, maxMarks: 100 },
      { student: student2._id, exam: exam3._id, subject: 'Business Management', marksObtained: 92, maxMarks: 100 },
      { student: student2._id, exam: exam4._id, subject: 'Business Statistics', marksObtained: 95, maxMarks: 100 },

      // Amit Verma marks
      { student: student3._id, exam: exam1._id, subject: 'Financial Accounting', marksObtained: 68, maxMarks: 100 },
      { student: student3._id, exam: exam2._id, subject: 'Business Economics', marksObtained: 62, maxMarks: 100 },
      { student: student3._id, exam: exam3._id, subject: 'Business Management', marksObtained: 71, maxMarks: 100 },
      { student: student3._id, exam: exam4._id, subject: 'Business Statistics', marksObtained: 65, maxMarks: 100 },
    ];

    for (const m of marksData) {
      await Marks.create({
        ...m,
        enteredBy: teacherUser1._id,
      });
    }

    // 7. Seed Past Attendance Records for Course 1 Students across 25 class days
    const attendanceStatuses = ['Present', 'Present', 'Present', 'Present', 'Late', 'Present', 'Absent'];
    const studentsGroup = [student1, student2, student3, student4];

    for (let day = 25; day >= 1; day--) {
      const classDate = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
      // skip weekends
      if (classDate.getDay() === 0 || classDate.getDay() === 6) continue;

      for (let sIdx = 0; sIdx < studentsGroup.length; sIdx++) {
        const student = studentsGroup[sIdx];
        let status = 'Present';
        
        // Match PRD example: Rahul Sharma has ~88% attendance (Present in 22 of 25)
        if (sIdx === 0 && (day === 4 || day === 11 || day === 19)) {
          status = 'Absent';
        } else if (sIdx === 2 && (day % 4 === 0)) {
          status = 'Absent';
        } else if (sIdx === 3 && (day % 6 === 0)) {
          status = 'Late';
        }

        await Attendance.create({
          student: student._id,
          course: course1._id,
          date: classDate,
          status,
          markedBy: teacherUser1._id,
          remarks: status === 'Late' ? 'Arrived 10 mins late' : '',
        });
      }
    }

    // 8. Create Welcome Notifications & Audit Logs
    await Notification.create({
      recipientRole: 'all',
      title: 'Welcome to the Student Management System',
      message: 'The new unified academic platform is now live. Check your timetable and upcoming examination schedule.',
      type: 'info',
    });

    await Notification.create({
      recipient: studentUser1._id,
      title: 'Mid-Term Results Published',
      message: 'Your Mid-Term Examination results have been published. Overall GPA: 3.7 (Grade A, 84.5%).',
      type: 'exam',
    });

    await AuditLog.create({
      action: 'SYSTEM_INITIALIZATION',
      module: 'AUTH',
      details: 'System database seeded with baseline demo administrators, faculties, students, and courses.',
      performedBy: adminUser._id,
      performerRole: 'admin',
    });

    console.log('✅ Demo Seed Data successfully inserted!');
    console.log('---------------------------------------------------------');
    console.log('🔑 Quick Login Credentials:');
    console.log('   Admin:   admin@sms.com      / password123');
    console.log('   Teacher: teacher@sms.com    / password123');
    console.log('   Student: student@sms.com    / password123');
    console.log('---------------------------------------------------------');
  } catch (error) {
    console.error('❌ Database Seeding Error:', error);
  }
};

module.exports = { seedDatabase };
