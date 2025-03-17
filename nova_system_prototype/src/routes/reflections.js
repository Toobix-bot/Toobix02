const express = require('express');
const router = express.Router();
const { 
  getReflections,
  getReflectionById,
  createReflection,
  updateReflection,
  deleteReflection,
  getReflectionQuestions
} = require('../controllers/reflectionController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Get reflection questions
router.get('/questions', getReflectionQuestions);

// Get all reflections and create new reflection
router.route('/')
  .get(getReflections)
  .post(createReflection);

// Get, update, and delete specific reflection
router.route('/:id')
  .get(getReflectionById)
  .put(updateReflection)
  .delete(deleteReflection);

module.exports = router;
