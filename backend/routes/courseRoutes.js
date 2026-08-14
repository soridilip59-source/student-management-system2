const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

router.use(authenticateUser);

router
  .route('/')
  .get(getCourses)
  .post(authorizeRoles('admin'), createCourse);

router
  .route('/:id')
  .get(getCourseById)
  .put(authorizeRoles('admin'), updateCourse)
  .delete(authorizeRoles('admin'), deleteCourse);

module.exports = router;
