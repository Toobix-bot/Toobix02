const express = require('express');
const router = express.Router();
const { 
  getQuests,
  getQuestById,
  createQuest,
  updateQuest,
  updateQuestProgress,
  deleteQuest
} = require('../controllers/questController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Get all quests and create new quest
router.route('/')
  .get(getQuests)
  .post(createQuest);

// Get, update, and delete specific quest
router.route('/:id')
  .get(getQuestById)
  .put(updateQuest)
  .delete(deleteQuest);

// Update quest progress
router.put('/:id/progress', updateQuestProgress);

module.exports = router;
