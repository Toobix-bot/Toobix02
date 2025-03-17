const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'long-term']
  },
  category: {
    type: String,
    required: true
  },
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'completed', 'failed'],
    default: 'active'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  xpReward: {
    type: Number,
    required: true
  },
  skillRewards: [{
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    },
    xpAmount: {
      type: Number,
      required: true
    }
  }],
  linkedNPC: {
    type: String
  },
  steps: [{
    description: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Quest', QuestSchema);
