const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

function calculateLevel(correctCount) {
  if (correctCount >= 100) return { level: 5, nextLevelAt: 120 };
  if (correctCount >= 75) return { level: 4, nextLevelAt: 100 };
  if (correctCount >= 50) return { level: 3, nextLevelAt: 75 };
  if (correctCount >= 25) return { level: 2, nextLevelAt: 50 };
  return { level: 1, nextLevelAt: 25 };
}

router.get('/status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const correctCount = user?.correctCount || 0;
    const levelInfo = calculateLevel(correctCount);

    res.json(levelInfo);
  } catch (error) {
    console.error('Error fetching level status:', error);
    res.status(500).json({ error: 'Failed to get level status' });
  }
});

module.exports = router;
