const express = require('express');
const router = express.Router();
const {
  getAttendance,
  markAttendance,
  bulkMarkAttendance,
  updateAttendance,
  getStudentAttendanceStats,
} = require('../controllers/attendanceController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

router.use(authenticateUser);

router
  .route('/')
  .get(getAttendance)
  .post(authorizeRoles('admin', 'teacher'), markAttendance);

router.post('/bulk', authorizeRoles('admin', 'teacher'), bulkMarkAttendance);
router.get('/student/:studentId', getStudentAttendanceStats);
router.put('/:id', authorizeRoles('admin', 'teacher'), updateAttendance);

module.exports = router;
