const express = require('express');
const router = express.Router();
const { 
  getCityData,
  updateCityData,
  getCityBuildings,
  addCityBuilding,
  updateCityBuilding,
  getCityNPCs,
  addCityNPC
} = require('../controllers/cityController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// City main routes
router.route('/')
  .get(getCityData)
  .put(updateCityData);

// Building routes
router.route('/buildings')
  .get(getCityBuildings)
  .post(addCityBuilding);

router.route('/buildings/:id')
  .put(updateCityBuilding);

// NPC routes
router.route('/npcs')
  .get(getCityNPCs)
  .post(addCityNPC);

module.exports = router;
