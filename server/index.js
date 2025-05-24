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
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.options('*', cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
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
let authRoutes;
try {
  authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ /api/auth routes mounted');
} catch (err) {
  console.error('❌ Failed to load /api/auth routes:', err.message);
}

const attemptsRoutes = require('./routes/attempts');
app.use('/api/attempts', attemptsRoutes);
console.log('✅ /api/attempts routes mounted');

// const authMiddleware = require('./middleware/auth');

// app.get('/api/protected', authMiddleware, (req, res) => {
//   res.status(200).json({ message: '✅ You are authorized!', user: req.user });
// });

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
