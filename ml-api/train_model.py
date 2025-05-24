<file name=server/models/Attempt.js>const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  score: {
    type: Number,
    required: true,
  },
  timeTaken: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Attempt', AttemptSchema);
</file>

<file name=server/routes/attempts.js>const express = require('express');
const router = express.Router();
const Attempt = require('../models/Attempt');
const axios = require('axios');

router.post('/attempt', async (req, res) => {
  try {
    const { userId, total, score, timeTaken } = req.body;

    const recResponse = await axios.post('http://localhost:5001/recommend', {
      accuracy: total > 0 ? score / total : 0,
      timeTaken,
      score: score / 10
    });
    const recommendedLevel = recResponse.data.recommendedLevel;

    const newAttempt = new Attempt({
      userId,
      level: recommendedLevel,
      score,
      timeTaken,
    });

    await newAttempt.save();

    res.status(201).json(newAttempt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
</file>