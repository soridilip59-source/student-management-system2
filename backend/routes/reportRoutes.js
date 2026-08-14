const express = require('express');
const router = express.Router();
const {
  exportStudentsCSV,
  exportAttendanceCSV,
  exportMarksCSV,
} = require('../controllers/reportController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/students/csv', authorizeRoles('admin', 'teacher'), exportStudentsCSV);
router.get('/attendance/csv', authorizeRoles('admin', 'teacher'), exportAttendanceCSV);
router.get('/marks/csv', authorizeRoles('admin', 'teacher'), exportMarksCSV);

module.exports = router;
