const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

// Debugging log for environment variables
console.log('🛠 Loading environment variables...');

// Middleware
console.log('🛠 Loading middleware...');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // 🔧 确保表单也能解析

// Debugging middleware to log incoming request bodies
app.use((req, res, next) => {
  console.log('🔍 Incoming request:', req.method, req.url);
  console.log('🔍 Body:', req.body);
  next();
});

// Routes
console.log('🔁 Mounting /api/auth routes...');
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes); // ✅ 放在中间件之后，app.listen()之前
console.log('✅ /api/auth routes mounted');

const authMiddleware = require('./middleware/auth');

// 受保护的 GET 路由示例
app.get('/api/protected', authMiddleware, (req, res) => {
  res.status(200).json({ message: '✅ You are authorized!', user: req.user });
});

// Direct test POST route
app.post('/test-direct', (req, res) => {
  console.log('📥 Received direct POST to /test-direct');
  console.log('Body:', req.body);
  res.json({ message: '✅ /test-direct working!' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
  });

// Test Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
