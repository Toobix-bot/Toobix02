const Reflection = require('../models/Reflection');

// @desc    Get all reflections for a user
// @route   GET /api/reflections
// @access  Private
const getReflections = async (req, res) => {
  try {
    const { type, limit } = req.query;
    let query = { userId: req.user._id };
    
    // Filter by type if provided
    if (type) {
      query.type = type;
    }
    
    let reflections = await Reflection.find(query)
      .sort({ date: -1 })
      .limit(limit ? parseInt(limit) : 0);
      
    res.json(reflections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a single reflection
// @route   GET /api/reflections/:id
// @access  Private
const getReflectionById = async (req, res) => {
  try {
    const reflection = await Reflection.findOne({ 
      _id: req.params.id,
      userId: req.user._id 
    });

    if (reflection) {
      res.json(reflection);
    } else {
      res.status(404).json({ message: 'Reflection not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new reflection
// @route   POST /api/reflections
// @access  Private
const createReflection = async (req, res) => {
  try {
    const { 
      type, 
      content, 
      mood, 
      energyLevel, 
      questions, 
      achievements, 
      challenges, 
      insights, 
      goals 
    } = req.body;

    const reflection = await Reflection.create({
      userId: req.user._id,
      type,
      content,
      mood,
      energyLevel,
      questions: questions || [],
      achievements: achievements || [],
      challenges: challenges || [],
      insights: insights || [],
      goals: goals || []
    });

    if (reflection) {
      res.status(201).json(reflection);
    } else {
      res.status(400).json({ message: 'Invalid reflection data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a reflection
// @route   PUT /api/reflections/:id
// @access  Private
const updateReflection = async (req, res) => {
  try {
    const reflection = await Reflection.findOne({ 
      _id: req.params.id,
      userId: req.user._id 
    });

    if (reflection) {
      reflection.content = req.body.content || reflection.content;
      reflection.mood = req.body.mood || reflection.mood;
      reflection.energyLevel = req.body.energyLevel || reflection.energyLevel;
      
      if (req.body.questions) reflection.questions = req.body.questions;
      if (req.body.achievements) reflection.achievements = req.body.achievements;
      if (req.body.challenges) reflection.challenges = req.body.challenges;
      if (req.body.insights) reflection.insights = req.body.insights;
      if (req.body.goals) reflection.goals = req.body.goals;

      const updatedReflection = await reflection.save();
      res.json(updatedReflection);
    } else {
      res.status(404).json({ message: 'Reflection not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a reflection
// @route   DELETE /api/reflections/:id
// @access  Private
const deleteReflection = async (req, res) => {
  try {
    const reflection = await Reflection.findOne({ 
      _id: req.params.id,
      userId: req.user._id 
    });

    if (reflection) {
      await reflection.remove();
      res.json({ message: 'Reflection removed' });
    } else {
      res.status(404).json({ message: 'Reflection not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reflection questions
// @route   GET /api/reflections/questions
// @access  Private
const getReflectionQuestions = async (req, res) => {
  try {
    const { type } = req.query;
    
    // Basic reflection questions based on type
    let questions = [];
    
    if (type === 'daily') {
      questions = [
        "Was war heute dein größter Erfolg?",
        "Welche Herausforderungen hast du heute gemeistert?",
        "Was hast du heute gelernt?",
        "Wie war deine Energie und Stimmung heute?",
        "Was nimmst du dir für morgen vor?"
      ];
    } else if (type === 'weekly') {
      questions = [
        "Was waren deine wichtigsten Erfolge diese Woche?",
        "Welche Fortschritte hast du bei deinen Zielen gemacht?",
        "Welche Herausforderungen sind aufgetreten und wie hast du sie bewältigt?",
        "Was hast du diese Woche über dich selbst gelernt?",
        "Wie war deine Work-Life-Balance diese Woche?",
        "Was möchtest du nächste Woche anders machen?"
      ];
    } else if (type === 'monthly') {
      questions = [
        "Welche Meilensteine hast du diesen Monat erreicht?",
        "Wie haben sich deine Skills in diesem Monat entwickelt?",
        "Welche Muster oder Gewohnheiten hast du bei dir beobachtet?",
        "Was hat dich diesen Monat am meisten motiviert?",
        "Welche Ziele setzt du dir für den kommenden Monat?"
      ];
    } else {
      questions = [
        "Was beschäftigt dich gerade am meisten?",
        "Welche Fortschritte bemerkst du in deiner Entwicklung?",
        "Welche Herausforderungen stehen dir bevor?",
        "Was gibt dir Energie und Motivation?"
      ];
    }
    
    res.json({ questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getReflections,
  getReflectionById,
  createReflection,
  updateReflection,
  deleteReflection,
  getReflectionQuestions
};
