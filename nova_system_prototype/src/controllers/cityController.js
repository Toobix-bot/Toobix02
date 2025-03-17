const City = require('../models/City');
const User = require('../models/User');

// @desc    Get city data for a user
// @route   GET /api/city
// @access  Private
const getCityData = async (req, res) => {
  try {
    let city = await City.findOne({ userId: req.user._id });
    
    // If no city exists for the user, create a default one
    if (!city) {
      city = await createDefaultCity(req.user._id);
    }
    
    res.json(city);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update city data
// @route   PUT /api/city
// @access  Private
const updateCityData = async (req, res) => {
  try {
    let city = await City.findOne({ userId: req.user._id });
    
    if (!city) {
      city = await createDefaultCity(req.user._id);
    }
    
    // Update city level if provided
    if (req.body.level) {
      city.level = req.body.level;
    }
    
    const updatedCity = await city.save();
    res.json(updatedCity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all buildings in the city
// @route   GET /api/city/buildings
// @access  Private
const getCityBuildings = async (req, res) => {
  try {
    const city = await City.findOne({ userId: req.user._id });
    
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    
    res.json(city.buildings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add a new building to the city
// @route   POST /api/city/buildings
// @access  Private
const addCityBuilding = async (req, res) => {
  try {
    const { type, name, position, linkedSkill, description } = req.body;
    
    const city = await City.findOne({ userId: req.user._id });
    
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    
    city.buildings.push({
      type,
      name,
      level: 1,
      position,
      unlocked: true,
      linkedSkill,
      description
    });
    
    await city.save();
    res.status(201).json(city.buildings[city.buildings.length - 1]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a building in the city
// @route   PUT /api/city/buildings/:id
// @access  Private
const updateCityBuilding = async (req, res) => {
  try {
    const city = await City.findOne({ userId: req.user._id });
    
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    
    const buildingIndex = city.buildings.findIndex(
      building => building._id.toString() === req.params.id
    );
    
    if (buildingIndex === -1) {
      return res.status(404).json({ message: 'Building not found' });
    }
    
    // Update building properties
    if (req.body.name) city.buildings[buildingIndex].name = req.body.name;
    if (req.body.level) city.buildings[buildingIndex].level = req.body.level;
    if (req.body.position) city.buildings[buildingIndex].position = req.body.position;
    if (req.body.unlocked !== undefined) city.buildings[buildingIndex].unlocked = req.body.unlocked;
    if (req.body.linkedSkill) city.buildings[buildingIndex].linkedSkill = req.body.linkedSkill;
    if (req.body.description) city.buildings[buildingIndex].description = req.body.description;
    
    await city.save();
    res.json(city.buildings[buildingIndex]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all NPCs in the city
// @route   GET /api/city/npcs
// @access  Private
const getCityNPCs = async (req, res) => {
  try {
    const city = await City.findOne({ userId: req.user._id });
    
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    
    res.json(city.npcs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add a new NPC to the city
// @route   POST /api/city/npcs
// @access  Private
const addCityNPC = async (req, res) => {
  try {
    const { name, role, position, dialogues } = req.body;
    
    const city = await City.findOne({ userId: req.user._id });
    
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    
    city.npcs.push({
      name,
      role,
      position,
      unlocked: true,
      dialogues: dialogues || [],
      quests: []
    });
    
    await city.save();
    res.status(201).json(city.npcs[city.npcs.length - 1]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to create a default city for a new user
const createDefaultCity = async (userId) => {
  const defaultCity = {
    userId,
    level: 1,
    buildings: [
      {
        type: 'headquarters',
        name: 'NOVA-HQ',
        level: 1,
        position: { x: 50, y: 50 },
        unlocked: true,
        description: 'Das Zentrum deiner NOVA-Stadt. Hier werden alle Strategien und Pläne verwaltet.'
      },
      {
        type: 'temple',
        name: 'Tempel der Reflexion',
        level: 1,
        position: { x: 30, y: 70 },
        unlocked: true,
        description: 'Ein Ort für Meditation und Selbstreflexion.'
      },
      {
        type: 'academy',
        name: 'Akademie des Wissens',
        level: 1,
        position: { x: 70, y: 30 },
        unlocked: true,
        description: 'Hier werden neue Fähigkeiten erlernt und verbessert.'
      }
    ],
    npcs: [
      {
        name: 'Meister Kaelos',
        role: 'Mentor',
        position: { x: 55, y: 55 },
        unlocked: true,
        dialogues: [
          {
            text: 'Willkommen in deiner NOVA-Stadt! Ich bin Meister Kaelos, dein Mentor auf dieser Reise der Selbstentwicklung.',
            responses: ['Danke für den Empfang!', 'Wie funktioniert dieses System?'],
            conditions: {}
          },
          {
            text: 'NOVA ist ein System zur persönlichen Entwicklung. Durch Quests, Reflexionen und bewusste Handlungen sammelst du XP und entwickelst deine Fähigkeiten.',
            responses: ['Verstanden!', 'Wo soll ich anfangen?'],
            conditions: {}
          }
        ],
        quests: []
      }
    ],
    events: []
  };
  
  return await City.create(defaultCity);
};

module.exports = {
  getCityData,
  updateCityData,
  getCityBuildings,
  addCityBuilding,
  updateCityBuilding,
  getCityNPCs,
  addCityNPC
};
