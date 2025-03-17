const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Mentale Stärke',
      'Lernen & Wissen',
      'Physische Energie',
      'Soziale Skills',
      'Kreativität',
      'Disziplin',
      'Wohlstand'
    ]
  },
  name: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    default: 1
  },
  currentXP: {
    type: Number,
    default: 0
  },
  requiredXP: {
    type: Number,
    default: 100
  },
  description: {
    type: String,
    default: ''
  },
  activities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }]
}, {
  timestamps: true
});

// Method to add XP to a skill
SkillSchema.methods.addXP = function(amount) {
  this.currentXP += amount;
  
  // Check if level up is needed
  while (this.currentXP >= this.requiredXP) {
    this.currentXP -= this.requiredXP;
    this.level += 1;
    this.requiredXP = 100 * this.level; // Each level requires 100 more XP
  }
  
  return this.save();
};

module.exports = mongoose.model('Skill', SkillSchema);
