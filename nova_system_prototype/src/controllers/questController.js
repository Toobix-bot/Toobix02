const Quest = require('../models/Quest');
const Skill = require('../models/Skill');
const User = require('../models/User');

// @desc    Get all quests for a user
// @route   GET /api/quests
// @access  Private
const getQuests = async (req, res) => {
  try {
    const { type, status } = req.query;
    let query = { userId: req.user._id };
    
    // Filter by type if provided
    if (type) {
      query.type = type;
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    const quests = await Quest.find(query).sort({ createdAt: -1 });
    res.json(quests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a single quest
// @route   GET /api/quests/:id
// @access  Private
const getQuestById = async (req, res) => {
  try {
    const quest = await Quest.findOne({ 
      _id: req.params.id,
      userId: req.user._id 
    });

    if (quest) {
      res.json(quest);
    } else {
      res.status(404).json({ message: 'Quest not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new quest
// @route   POST /api/quests
// @access  Private
const createQuest = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      type, 
      category, 
      difficulty, 
      dueDate, 
      xpReward, 
      skillRewards,
      steps 
    } = req.body;

    const quest = await Quest.create({
      userId: req.user._id,
      title,
      description,
      type,
      category,
      difficulty,
      dueDate,
      xpReward,
      skillRewards,
      steps: steps || []
    });

    if (quest) {
      res.status(201).json(quest);
    } else {
      res.status(400).json({ message: 'Invalid quest data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a quest
// @route   PUT /api/quests/:id
// @access  Private
const updateQuest = async (req, res) => {
  try {
    const quest = await Quest.findOne({ 
      _id: req.params.id,
      userId: req.user._id 
    });

    if (quest) {
      quest.title = req.body.title || quest.title;
      quest.description = req.body.description || quest.description;
      quest.type = req.body.type || quest.type;
      quest.category = req.body.category || quest.category;
      quest.difficulty = req.body.difficulty || quest.difficulty;
      quest.dueDate = req.body.dueDate || quest.dueDate;
      quest.xpReward = req.body.xpReward || quest.xpReward;
      
      if (req.body.skillRewards) {
        quest.skillRewards = req.body.skillRewards;
      }
      
      if (req.body.steps) {
        quest.steps = req.body.steps;
      }

      const updatedQuest = await quest.save();
      res.json(updatedQuest);
    } else {
      res.status(404).json({ message: 'Quest not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update quest progress
// @route   PUT /api/quests/:id/progress
// @access  Private
const updateQuestProgress = async (req, res) => {
  try {
    const { progress, stepIndex } = req.body;
    
    const quest = await Quest.findOne({ 
      _id: req.params.id,
      userId: req.user._id 
    });

    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }
    
    // Update overall progress if provided
    if (progress !== undefined) {
      quest.progress = progress;
      
      // If progress is 100%, mark as completed
      if (progress === 100) {
        quest.status = 'completed';
        quest.completedDate = Date.now();
        
        // Award XP for completing the quest
        const user = await User.findById(req.user._id);
        user.stats.totalXP += quest.xpReward;
        await user.save();
        
        // Award skill-specific XP
        if (quest.skillRewards && quest.skillRewards.length > 0) {
          for (const reward of quest.skillRewards) {
            const skill = await Skill.findOne({
              _id: reward.skillId,
              userId: req.user._id
            });
            
            if (skill) {
              await skill.addXP(reward.xpAmount);
            }
          }
        }
      }
    }
    
    // Update specific step if stepIndex is provided
    if (stepIndex !== undefined && quest.steps[stepIndex]) {
      quest.steps[stepIndex].completed = true;
      
      // Check if all steps are completed
      const allStepsCompleted = quest.steps.every(step => step.completed);
      if (allStepsCompleted) {
        quest.progress = 100;
        quest.status = 'completed';
        quest.completedDate = Date.now();
        
        // Award XP for completing the quest
        const user = await User.findById(req.user._id);
        user.stats.totalXP += quest.xpReward;
        await user.save();
        
        // Award skill-specific XP
        if (quest.skillRewards && quest.skillRewards.length > 0) {
          for (const reward of quest.skillRewards) {
            const skill = await Skill.findOne({
              _id: reward.skillId,
              userId: req.user._id
            });
            
            if (skill) {
              await skill.addXP(reward.xpAmount);
            }
          }
        }
      }
    }
    
    const updatedQuest = await quest.save();
    res.json(updatedQuest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a quest
// @route   DELETE /api/quests/:id
// @access  Private
const deleteQuest = async (req, res) => {
  try {
    const quest = await Quest.findOne({ 
      _id: req.params.id,
      userId: req.user._id 
    });

    if (quest) {
      await quest.remove();
      res.json({ message: 'Quest removed' });
    } else {
      res.status(404).json({ message: 'Quest not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getQuests,
  getQuestById,
  createQuest,
  updateQuest,
  updateQuestProgress,
  deleteQuest
};
