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
// TC-08 FIX: Restrict CORS to frontend origin only but allow localhost on any port during development
const allowedOrigins = [process.env.FRONTEND_URL].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // Allow explicitly configured origins
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Allow localhost and 127.0.0.1 on any port (development servers like Vite may use dynamic ports)
    try {
      const url = new URL(origin);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return callback(null, true);
    } catch (e) {
      // ignore parse errors
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

const db = require('./lib/db');

// Check for Groq API Key
if (!process.env.GROQ_API_KEY) {
  console.error('\n==================================================');
  console.error('⚠️  WARNING: GROQ_API_KEY is not set in .env!');
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

// Health / readiness probe
app.get('/health', async (req, res) => {
  const mongoState = db.getMongoState(); // 0 = disconnected, 1 = connected
  const healthy = mongoState === 1;
  const details = {
    uptime: process.uptime(),
    mongoState,
    now: new Date().toISOString()
  };
  if (healthy) return res.status(200).json({ status: 'ok', details });
  return res.status(503).json({ status: 'unhealthy', details });
});

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;

async function startServer(port = DEFAULT_PORT, maxAttempts = 5) {
  try {
    await db.connectDatabase();
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    server.on('error', async (err) => {
      if (err.code === 'EADDRINUSE' && maxAttempts > 0) {
        console.warn(`Port ${port} in use, trying port ${port + 1}...`);
        server.close();
        await startServer(port + 1, maxAttempts - 1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
