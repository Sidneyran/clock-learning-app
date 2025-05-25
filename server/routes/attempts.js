const express = require('express');
const router = express.Router();
const Attempt = require('../models/Attempt');
const authMiddleware = require('../middleware/auth'); // 用于解析 JWT

// 测试路由是否挂载成功
router.get('/test', (req, res) => {
  res.send('✅ Attempts route is working');
});

// @route   POST /api/attempts
// @desc    Upload practice or challenge result
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('Decoded user:', req.user);
    const { mode, level, score, total, timeTaken, submittedToLeaderboard, correct, questionDetails } = req.body;

    if (mode === 'game' && (!Array.isArray(questionDetails) || questionDetails.length === 0)) {
      return res.status(400).json({ message: 'Game mode requires questionDetails' });
    }

    let numericLevel;
    if (typeof level === 'string') {
      numericLevel = level === 'easy' ? 1 : level === 'medium' ? 2 : level === 'hard' ? 3 : NaN;
    } else {
      numericLevel = parseInt(level);
    }
    if (
      !mode || isNaN(numericLevel) ||
      score === undefined || score === null ||
      total === undefined || total === null ||
      !req.user || !req.user.id
    ) {
      return res.status(400).json({ message: 'Missing required fields or user info' });
    }

    console.log('Saving attempt:', {
      userId: req.user.id,
      username: req.user.username || 'Anonymous',
      mode,
      level: numericLevel,
      score,
      total,
      accuracy: total > 0 ? score / total : 0,
      correct,
      timeTaken,
      submittedToLeaderboard: submittedToLeaderboard || false,
      questionDetails: mode === 'game' ? questionDetails : undefined,
    });

    const newAttempt = new Attempt({
      userId: req.user.id,         // 从 token 中解析出来的
      username: req.user.username || 'Anonymous',
      mode,
      level: numericLevel,
      score,
      total,
      accuracy: total > 0 ? score / total : 0,
      correct,
      timeTaken,
      submittedToLeaderboard: submittedToLeaderboard || false,
      questionDetails: mode === 'game' ? questionDetails : undefined,
      timestamp: new Date()
    });

    await newAttempt.save();
    res.status(201).json({ message: 'Attempt saved', attempt: newAttempt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attempts
// @desc    Get current user's attempts
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const attempts = await Attempt.find({ userId: req.user.id }).sort({ timestamp: -1 });
    res.status(200).json(attempts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve attempts' });
  }
});

// @route   GET /api/attempts/leaderboard
// @desc    Get top scores submitted to leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const topScores = await Attempt.find({ submittedToLeaderboard: true })
      .sort({ accuracy: -1, timeTaken: 1 })
      .limit(10);
    res.status(200).json(topScores);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve leaderboard' });
  }
});

// @route   DELETE /api/attempts
// @desc    Delete all attempts for current user
// @access  Private
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await Attempt.deleteMany({ userId: req.user.id });
    res.status(200).json({ message: 'All attempts deleted for current user' });
  } catch (err) {
    console.error('Error deleting attempts:', err);
    res.status(500).json({ message: 'Failed to delete attempts' });
  }
});

module.exports = router;