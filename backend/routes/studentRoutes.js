const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

router.use(authenticateUser);

router
  .route('/')
  .get(getStudents)
  .post(authorizeRoles('admin', 'teacher'), createStudent);

router
  .route('/:id')
  .get(getStudentById)
  .put(authorizeRoles('admin', 'teacher'), updateStudent)
  .delete(authorizeRoles('admin'), deleteStudent);

module.exports = router;
