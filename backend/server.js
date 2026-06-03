const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const supportRoutes = require('./routes/support');
const seedAdmin = require('./seed');
const sellerRoutes = require('./routes/seller');

const app = express();

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:4200';
const extraDevOrigins = ['http://localhost:52957', 'http://127.0.0.1:52957'];
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later.' },
});

app.disable('x-powered-by');
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
// Support multiple allowed origins and be permissive during local development.
const allowedOrigins = String(allowedOrigin || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
if (process.env.NODE_ENV !== 'production') {
  // include common dev host/ports the dev server may use
  extraDevOrigins.forEach((o) => {
    if (!allowedOrigins.includes(o)) allowedOrigins.push(o);
  });
}

// Log allowed origins for debugging local CORS issues
console.log('[CORS] allowedOrigins:', allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin like mobile apps or curl
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (process.env.NODE_ENV !== 'production') return callback(null, true);
      callback(new Error('CORS policy: This origin is not allowed'));
    },
    credentials: true,
  })
);

// DEV: force the Access-Control-Allow-Origin to the actual request origin
// This helps local dev when various dev servers/proxies are used.
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const origin = req.headers.origin || '';
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    next();
  });
}
// Seller apply route needs larger payload for base64 photo uploads
app.use('/api/seller/apply', express.json({ limit: '5mb' }));
// Profile photo endpoint allows base64 transport overhead, while route enforces 1MB file size.
app.use('/api/user/profile', express.json({ limit: '2mb' }));
app.use(express.json({ limit: '50kb' }));
app.use(apiLimiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/seller', sellerRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'FruitMart backend is running. Use /api/health or the /api/* routes.',
  });
});

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'API route not found.' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await seedAdmin();
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
