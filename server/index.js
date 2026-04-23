/* ================================================================
   index.js — Nextern Backend Entry Point
================================================================ */

// Load .env variables FIRST — before anything else
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const connectDB = require('./config/db');

// Import route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const driveRoutes = require('./routes/drives');

/* ── Connect to MongoDB ── */
connectDB();

/* ── Create Express app ── */
const app = express();

/* ── Security: Helmet headers ── */
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false
}));
app.disable('x-powered-by');

/* ── CORS: Allow frontend origins ── */
const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(allowed =>
            origin === allowed || origin.endsWith('.vercel.app')
        )) {
            callback(null, true);
        } else {
            console.log('CORS blocked:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

/* ── Parse request bodies ── */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* ── Passport (Google OAuth) ── */
app.use(passport.initialize());


/* ================================================================
   ROUTES
================================================================ */
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/roadmap', require('./routes/roadmap'));
app.use('/api/drives', driveRoutes);
app.use('/api/prep', require('./routes/prep'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/analyze', require('./routes/analyze.routes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/applications', require('./routes/applications.routes'));
app.use('/api/progress', require('./routes/progress.routes'));
app.use('/api/analytics', require('./routes/analytics'));

/* ── Health check ── */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Nextern API is running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

/* ── 404 handler ── */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found.`,
    });
});

/* ── Global error handler ── */
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    const message = process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : err.message;
    res.status(err.status || 500).json({
        success: false,
        message
    });
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});


/* ================================================================
   START SERVER
================================================================ */
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Nextern API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

const startScheduler = require('./scraper/schedule');
startScheduler();

const seedPosts = require('./scraper/seedPosts');
seedPosts();