const mongoose = require('mongoose');

const ReflectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'yearly']
  },
  date: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    required: true
  },
  energyLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      default: ''
    }
  }],
  achievements: [String],
  challenges: [String],
  insights: [String],
  goals: [{
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

module.exports = mongoose.model('Reflection', ReflectionSchema);
