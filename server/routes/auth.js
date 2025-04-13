const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // 确保你有这个模型
const jwt = require('jsonwebtoken');

// 测试 GET 路由
router.get('/test', (req, res) => {
  res.send('✅ This is a test GET route');
});

// 注册路由
router.post('/register', async (req, res) => {
  console.log('📥 Received request to /register');
  console.log('Body:', req.body);

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    console.log('❌ Missing fields');
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // 检查用户是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // 返回成功响应
    res.status(201).json({
      message: '🎉 User registered successfully!',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 登录路由
router.post('/login', async (req, res) => {
  console.log('📥 Received request to /login');
  console.log('Body:', req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    console.log('❌ Missing email or password');
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // 检查用户是否存在
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    console.log('✅ Login successful');
    res.status(200).json({
      message: '🎉 Login successful!',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;