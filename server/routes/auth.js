const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const router = express.Router();

/* ── HELPER ── */
const generateToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
const hasCollegeProfile = (user) => Boolean(user?.college && String(user.college).trim());

/* ================================================================
   REGISTER
================================================================ */
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password,
            gender, dob, city, state, country, bio,
            college, branch, year, cgpa, graduationYear,
            tenthPercent, twelfthPercent, activeBacklogs, internships, projects,
            skills, languages, certifications,
            targetCompanies, preferredRoles, preferredLocations, openToRelocate,
            linkedin, github, portfolio, leetcode } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });

        const user = await User.create({
            firstName, lastName, email, phone, password,
            gender, dob, city, state, country, bio,
            college, branch, year, cgpa, graduationYear,
            tenthPercent, twelfthPercent, activeBacklogs, internships, projects,
            skills, languages, certifications,
            targetCompanies, preferredRoles, preferredLocations, openToRelocate,
            linkedin, github, portfolio, leetcode
        });

        const token = generateToken(user._id);
        res.status(201).json({
            success: true, token,
            user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
});

/* ================================================================
   LOGIN
================================================================ */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Please provide email and password.' });

        const user = await User.findOne({ email }).select('+password');
        if (!user)
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });

        if (!user.password)
            return res.status(401).json({ success: false, message: 'This account uses Google sign-in.' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch)
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });

        const token = generateToken(user._id);
        res.json({
            success: true, token,
            user: {
                id: user._id, firstName: user.firstName, lastName: user.lastName,
                email: user.email, college: user.college, branch: user.branch, year: user.year, role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});

/* ================================================================
   GOOGLE OAUTH
================================================================ */
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
            user.googleId = profile.id;
            user.avatar = profile.photos[0]?.value;
            await user.save();
            return done(null, user);
        }

        user = await User.create({
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            avatar: profile.photos[0]?.value,
        });
        done(null, user);
    } catch (e) { done(e, null); }
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

/* ── Step 1: redirect to Google ── */
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

/* ── Step 2: Google calls back here ── */
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.CLIENT_URL}/login.html?error=oauth_failed`,
        session: false,
    }),
    (req, res) => {
        const token = generateToken(req.user._id);
        const fullName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
        const name = encodeURIComponent(fullName);
        const clientBaseUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '');
        let redirectPath;
        if (req.user.role === 'admin') {
            redirectPath = '/pages/admin.html';
        } else {
            redirectPath = hasCollegeProfile(req.user)
                ? '/pages/feed.html'
                : '/register.html';
        }

        res.redirect(`${clientBaseUrl}${redirectPath}?token=${token}&name=${name}`);
    }
);

/* ── LOGOUT ── */
router.get('/logout', (req, res) => res.json({ success: true, message: 'Logged out.' }));

module.exports = router;
