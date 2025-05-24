const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  username: { type: String, required: true },
  mode: { type: String, required: true },
  level: { type: Number, required: true },
  score: Number,
  total: Number,
  accuracy: Number,
  correct: { type: Boolean, required: true },
  timeTaken: Number,
  submittedToLeaderboard: { type: Boolean, default: false },
  questionDetails: { type: mongoose.Schema.Types.Mixed, required: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attempt', AttemptSchema);