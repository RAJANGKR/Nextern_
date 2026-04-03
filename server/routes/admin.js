/* ================================================================
   routes/admin.js
   All admin-only API endpoints
   Every route uses: protect (JWT check) + adminOnly (role check)
================================================================ */

const express = require('express');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Post = require('../models/post');
const protect = require('../middleware/protect');
const adminOnly = require('../middleware/adminOnly');
const router = express.Router();

router.use(protect, adminOnly);

const DRIVES_PATH = path.join(__dirname, '../../data/drives.json');

function loadDrives() {
    try {
        if (!fs.existsSync(DRIVES_PATH)) return { drives: [] };
        return JSON.parse(fs.readFileSync(DRIVES_PATH, 'utf8'));
    } catch (e) { return { drives: [] }; }
}

function saveDrives(data) {
    fs.writeFileSync(DRIVES_PATH, JSON.stringify(data, null, 2));
}

/* ── STATS ── */
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalPosts = await Post.countDocuments();
        const pinnedPosts = await Post.countDocuments({ isPinned: true });
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newUsers = await User.countDocuments({ createdAt: { $gte: weekAgo } });
        const drivesData = loadDrives();
        const totalDrives = drivesData.drives?.length || 0;
        const branchStats = await User.aggregate([{ $group: { _id: '$branch', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]);
        const collegeStats = await User.aggregate([{ $match: { college: { $exists: true, $ne: '' } } }, { $group: { _id: '$college', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]);
        res.json({ success: true, stats: { totalUsers, totalStudents, totalAdmins, totalPosts, pinnedPosts, newUsers, totalDrives, lastScraped: drivesData.lastUpdated || null, branchStats, collegeStats } });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

/* ── USERS ── */
router.get('/users', async (req, res) => {
    try {
        const { q, role, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (q) filter.$or = [
            { firstName: { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
            { college: { $regex: q, $options: 'i' } },
        ];
        const total = await User.countDocuments(filter);
        const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
        res.json({ success: true, total, page: parseInt(page), users });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/users/:id', async (req, res) => {
    try {
        const allowed = ['firstName', 'lastName', 'phone', 'college', 'branch', 'year', 'cgpa', 'graduationYear', 'skills', 'targetCompanies', 'linkedin', 'github', 'role'];
        const updates = {};
        allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        res.json({ success: true, user });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/users/:id', async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) return res.status(400).json({ success: false, message: "Can't delete your own account." });
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted.' });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

/* ── DRIVES ── */
router.get('/drives', (req, res) => {
    const data = loadDrives();
    res.json({ success: true, total: data.drives?.length || 0, drives: data.drives || [], lastUpdated: data.lastUpdated });
});

router.post('/drives', (req, res) => {
    try {
        const data = loadDrives();
        const newDrive = { id: `drive_manual_${Date.now()}`, ...req.body, source: 'manual', scrapedAt: new Date().toISOString() };
        data.drives = data.drives || [];
        data.drives.unshift(newDrive);
        data.lastUpdated = new Date().toISOString();
        saveDrives(data);
        res.status(201).json({ success: true, drive: newDrive });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/drives/:id', (req, res) => {
    try {
        const data = loadDrives();
        const idx = data.drives?.findIndex(d => d.id === req.params.id);
        if (idx === -1) return res.status(404).json({ success: false, message: 'Drive not found.' });
        data.drives[idx] = { ...data.drives[idx], ...req.body };
        data.lastUpdated = new Date().toISOString();
        saveDrives(data);
        res.json({ success: true, drive: data.drives[idx] });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/drives/:id', (req, res) => {
    try {
        const data = loadDrives();
        const before = data.drives?.length || 0;
        data.drives = data.drives?.filter(d => d.id !== req.params.id) || [];
        if (data.drives.length === before) return res.status(404).json({ success: false, message: 'Drive not found.' });
        data.lastUpdated = new Date().toISOString();
        saveDrives(data);
        res.json({ success: true, message: 'Drive deleted.' });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

/* ── POSTS ── */
router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).limit(50).populate('author', 'firstName lastName email');
        res.json({ success: true, posts });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/posts/:id', async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Post deleted.' });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/posts/:id/pin', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
        post.isPinned = !post.isPinned;
        await post.save();
        res.json({ success: true, isPinned: post.isPinned });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

/* ── TRIGGER SCRAPER ── */
router.post('/scrape', async (req, res) => {
    try {
        const runScraper = require('../scraper/index');
        res.json({ success: true, message: 'Scraper started in background.' });
        runScraper().catch(console.error);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;