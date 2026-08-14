const express = require('express');
const router = express.Router();
const {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
} = require('../controllers/examController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

router.use(authenticateUser);

router
  .route('/')
  .get(getExams)
  .post(authorizeRoles('admin', 'teacher'), createExam);

router
  .route('/:id')
  .get(getExamById)
  .put(authorizeRoles('admin', 'teacher'), updateExam)
  .delete(authorizeRoles('admin'), deleteExam);

module.exports = router;
