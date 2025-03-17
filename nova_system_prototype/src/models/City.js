const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: Number,
    default: 1
  },
  buildings: [{
    type: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    level: {
      type: Number,
      default: 1
    },
    position: {
      x: Number,
      y: Number
    },
    unlocked: {
      type: Boolean,
      default: false
    },
    linkedSkill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    },
    description: String
  }],
  npcs: [{
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    },
    position: {
      x: Number,
      y: Number
    },
    unlocked: {
      type: Boolean,
      default: false
    },
    dialogues: [{
      text: String,
      responses: [String],
      conditions: Object
    }],
    quests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quest'
    }]
  }],
  events: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    startDate: Date,
    endDate: Date,
    requirements: Object,
    rewards: Object
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('City', CitySchema);
