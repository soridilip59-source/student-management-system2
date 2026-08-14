const express = require('express');
const router = express.Router();
const {
  getMarks,
  enterMarks,
  bulkEnterMarks,
  getStudentReportCard,
} = require('../controllers/marksController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

router.use(authenticateUser);

router
  .route('/')
  .get(getMarks)
  .post(authorizeRoles('admin', 'teacher'), enterMarks);

router.post('/bulk', authorizeRoles('admin', 'teacher'), bulkEnterMarks);
router.get('/report-card/:studentId', getStudentReportCard);

module.exports = router;
