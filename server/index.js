/* ================================================================
   index.js — Nextern Backend Entry Point

   TEACH: This is the main file that:
   1. Loads environment variables from .env
   2. Connects to MongoDB
   3. Creates the Express app
   4. Registers middleware (cors, json parsing, passport)
   5. Mounts route handlers
   6. Starts listening on a port

   Run with:   npm run dev   (uses nodemon — auto-restarts on save)
   Or:         npm start     (plain node, no auto-restart)
================================================================ */

// Load .env variables FIRST — before anything else
require('dotenv').config();

const express = require('express');
const cors = require('cors');
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


/* ================================================================
   MIDDLEWARE
   TEACH: Middleware runs on EVERY request before route handlers.
   Order matters — register them in this order.
================================================================ */

/* CORS — allow requests from your frontend (live-server)
   Without this, the browser blocks API calls from a different origin.
   TEACH: CORS = Cross-Origin Resource Sharing
   Your frontend is on port 5500, backend on 5000 — different origins. */
app.use(cors({
    origin: [
        'http://127.0.0.1:5500',   // live-server default
        'http://localhost:5500',
        'http://127.0.0.1:3000',
        'http://localhost:3000',
    ],
    credentials: true,
}));

/* Parse incoming JSON request bodies
   TEACH: Without this, req.body would be undefined.
   express.json() reads the body and parses it as JSON. */
app.use(express.json());

/* Parse URL-encoded bodies (form submissions) */
app.use(express.urlencoded({ extended: false }));

/* Passport — needed for Google OAuth */
app.use(passport.initialize());


/* ================================================================
   ROUTES
   TEACH: app.use('/api/auth', authRoutes) means:
   Any request to /api/auth/... is handled by authRoutes.
   So POST /api/auth/login maps to the /login route in routes/auth.js
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

/* ── Health check route — visit http://localhost:5000/api/health ── */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Nextern API is running 🚀',
        timestamp: new Date().toISOString(),
    });
});

/* ── 404 handler — if no route matched ── */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found.`,
    });
});

/* ── Global error handler ── */
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Something went wrong on the server.',
    });
});


/* ================================================================
   START SERVER
================================================================ */
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`
  Starting Nextern API...
  PORT: ${PORT}
  `);
});

const startScheduler = require('./scraper/schedule');
startScheduler();

const seedPosts = require('./scraper/seedPosts');
seedPosts(); // seeds on server start if empty