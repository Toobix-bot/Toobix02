const Skill = require('../models/Skill');
const User = require('../models/User');

// @desc    Get all skills for a user
// @route   GET /api/skills
// @access  Private
const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find({ userId: req.user._id });
    res.json(skills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a single skill
// @route   GET /api/skills/:id
// @access  Private
const getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findOne({ 
      _id: req.params.id,
      userId: req.user._id 
    });

    if (skill) {
      res.json(skill);
    } else {
      res.status(404).json({ message: 'Skill not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new skill
// @route   POST /api/skills
// @access  Private
const createSkill = async (req, res) => {
  try {
    const { category, name, description } = req.body;

    const skill = await Skill.create({
      userId: req.user._id,
      category,
      name,
      description,
      level: 1,
      currentXP: 0,
      requiredXP: 100
    });

    if (skill) {
      res.status(201).json(skill);
    } else {
      res.status(400).json({ message: 'Invalid skill data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a skill
// @route   PUT /api/skills/:id
// @access  Private
const updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findOne({ 
      _id: req.params.id,
      userId: req.user._id 
    });

    if (skill) {
      skill.name = req.body.name || skill.name;
      skill.category = req.body.category || skill.category;
      skill.description = req.body.description || skill.description;

      const updatedSkill = await skill.save();
      res.json(updatedSkill);
    } else {
      res.status(404).json({ message: 'Skill not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add XP to a skill
// @route   POST /api/skills/:id/xp
// @access  Private
const addXPToSkill = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid XP amount' });
    }

    const skill = await Skill.findOne({ 
      _id: req.params.id,
      userId: req.user._id 
    });

    if (skill) {
      const oldLevel = skill.level;
      await skill.addXP(amount);
      
      // Check if level up occurred
      if (skill.level > oldLevel) {
        // Update user's total XP
        const user = await User.findById(req.user._id);
        user.stats.totalXP += amount;
        await user.save();
        
        res.json({ 
          skill, 
          levelUp: true, 
          oldLevel, 
          newLevel: skill.level 
        });
      } else {
        res.json({ 
          skill, 
          levelUp: false 
        });
      }
    } else {
      res.status(404).json({ message: 'Skill not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Private
const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findOne({ 
      _id: req.params.id,
      userId: req.user._id 
    });

    if (skill) {
      await skill.remove();
      res.json({ message: 'Skill removed' });
    } else {
      res.status(404).json({ message: 'Skill not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  addXPToSkill,
  deleteSkill
};
