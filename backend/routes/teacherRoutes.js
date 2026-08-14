const express = require('express');
const router = express.Router();
const {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} = require('../controllers/teacherController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

router.use(authenticateUser);

router
  .route('/')
  .get(getTeachers)
  .post(authorizeRoles('admin'), createTeacher);

router
  .route('/:id')
  .get(getTeacherById)
  .put(authorizeRoles('admin'), updateTeacher)
  .delete(authorizeRoles('admin'), deleteTeacher);

module.exports = router;
