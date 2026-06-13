const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const inventoryRoutes = require('./routes/inventory');
const recipeRoutes = require('./routes/recipes');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const donationRoutes = require('./routes/donations');
const familyRoutes = require('./routes/family');

const app = express();

const path = require('path');

// Middleware
// TC-08 FIX: Restrict CORS to frontend origin only
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// TC-07 FIX: Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

// TC-07 FIX: Aggressive rate limiter for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'AI rate limit reached. Please wait a moment.' }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Check for Gemini API Key
if (!process.env.GEMINI_API_KEY) {
  console.error('\n==================================================');
  console.error('⚠️  WARNING: GEMINI_API_KEY is not set in .env!');
  console.error('⚠️  AI features (Chat, Scanner, Recipes, Voice) will FAIL.');
  console.error('==================================================\n');
}

// Routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', aiLimiter, chatRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/family', familyRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Eco-Pantry API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
