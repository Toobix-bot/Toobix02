const express = require('express');
const router = express.Router();
const { 
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  addXPToSkill,
  deleteSkill
} = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Get all skills and create new skill
router.route('/')
  .get(getSkills)
  .post(createSkill);

// Get, update, and delete specific skill
router.route('/:id')
  .get(getSkillById)
  .put(updateSkill)
  .delete(deleteSkill);

// Add XP to skill
router.post('/:id/xp', addXPToSkill);

module.exports = router;
