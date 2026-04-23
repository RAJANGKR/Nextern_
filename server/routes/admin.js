/* ================================================================
   routes/admin.js — Complete Admin API
   All admin-only endpoints for the enhanced Nextern admin panel.
   Every route uses: protect (JWT check) + adminOnly (role check)
================================================================ */

const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const AdminLog = require('../models/AdminLog');
const Notification = require('../models/notification.model');
const protect = require('../middleware/protect');
const adminOnly = require('../middleware/adminOnly');
const router = express.Router();

router.use(protect, adminOnly);

/* ── Helper: log admin action ── */
async function logAction(adminId, action, target, details) {
    try {
        await AdminLog.create({ admin: adminId, action, target, details });
    } catch (e) { console.error('AdminLog error:', e.message); }
}

/* ════════════════════════════════════
   STATS (legacy — used by dashboard)
═════════════════════════════════════ */
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalPosts = await Post.countDocuments();
        const pinnedPosts = await Post.countDocuments({ isPinned: true });
        const totalDrives = await Drive.countDocuments();
        const totalApplications = await Application.countDocuments();

        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newUsers = await User.countDocuments({ createdAt: { $gte: weekAgo } });

        // Online now (active in last 5 mins)
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
        const onlineNow = await User.countDocuments({ lastActive: { $gte: fiveMinAgo }, role: 'student' });

        const branchStats = await User.aggregate([
            { $match: { branch: { $exists: true, $ne: '' } } },
            { $group: { _id: '$branch', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);
        const collegeStats = await User.aggregate([
            { $match: { college: { $exists: true, $ne: '' } } },
            { $group: { _id: '$college', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);

        res.json({
            success: true,
            stats: {
                totalUsers, totalStudents, totalAdmins, totalPosts, pinnedPosts,
                newUsers, totalDrives, totalApplications, onlineNow,
                branchStats, collegeStats,
            },
        });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});


/* ════════════════════════════════════
   ANALYTICS
═════════════════════════════════════ */

/* GET /api/admin/analytics/overview */
router.get('/analytics/overview', async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalDrives = await Drive.countDocuments();
        const totalApplications = await Application.countDocuments();
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
        const onlineNow = await User.countDocuments({ lastActive: { $gte: fiveMinAgo }, role: 'student' });

        // Average CGPA
        const cgpaAgg = await User.aggregate([
            { $match: { cgpa: { $exists: true, $gt: 0 }, role: 'student' } },
            { $group: { _id: null, avg: { $avg: '$cgpa' } } },
        ]);
        const avgCGPA = cgpaAgg[0]?.avg?.toFixed(2) || '0';

        // Signups per day (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const signupsPerDay = await User.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo }, role: 'student' } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);

        // Applications per day (last 30 days)
        const appsPerDay = await Application.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);

        // Drive status breakdown
        const driveStatusBreakdown = await Drive.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        // Top 5 most applied drives
        const topDrives = await Application.aggregate([
            { $group: { _id: '$drive', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'drives', localField: '_id', foreignField: '_id', as: 'drive' } },
            { $unwind: { path: '$drive', preserveNullAndEmptyArrays: true } },
            { $project: { count: 1, company: '$drive.company', role: '$drive.role' } },
        ]);

        // Branch-wise avg CGPA
        const branchCGPA = await User.aggregate([
            { $match: { cgpa: { $gt: 0 }, branch: { $exists: true, $ne: '' }, role: 'student' } },
            { $group: { _id: '$branch', avgCGPA: { $avg: '$cgpa' }, count: { $sum: 1 } } },
            { $sort: { avgCGPA: -1 } },
        ]);

        // Placement rate (students with offers / total students)
        const offeredStudents = await Application.distinct('student', { status: 'offered' });
        const placementRate = totalStudents > 0 ? ((offeredStudents.length / totalStudents) * 100).toFixed(1) : '0';

        res.json({
            success: true,
            data: {
                totalStudents, totalDrives, totalApplications, onlineNow, avgCGPA,
                placementRate, signupsPerDay, appsPerDay, driveStatusBreakdown,
                topDrives, branchCGPA,
            },
        });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

/* GET /api/admin/analytics/students */
router.get('/analytics/students', async (req, res) => {
    try {
        // Complete vs incomplete profiles
        const complete = await User.countDocuments({ role: 'student', isProfileComplete: true });
        const incomplete = await User.countDocuments({ role: 'student', isProfileComplete: { $ne: true } });

        // CGPA distribution
        const cgpaDist = await User.aggregate([
            { $match: { cgpa: { $exists: true, $gt: 0 }, role: 'student' } },
            {
                $bucket: {
                    groupBy: '$cgpa',
                    boundaries: [0, 6, 7, 8, 9, 10.1],
                    default: 'Other',
                    output: { count: { $sum: 1 } },
                },
            },
        ]);

        // Top skills
        const topSkills = await User.aggregate([
            { $match: { role: 'student' } },
            { $unwind: '$skills' },
            { $group: { _id: '$skills', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
        ]);

        // Top target companies
        const topCompanies = await User.aggregate([
            { $match: { role: 'student' } },
            { $unwind: '$targetCompanies' },
            { $group: { _id: '$targetCompanies', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 15 },
        ]);

        // College-wise count
        const collegeWise = await User.aggregate([
            { $match: { college: { $exists: true, $ne: '' }, role: 'student' } },
            { $group: { _id: '$college', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);

        // Year-wise count
        const yearWise = await User.aggregate([
            { $match: { year: { $exists: true, $ne: '' }, role: 'student' } },
            { $group: { _id: '$year', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);

        res.json({
            success: true,
            data: { complete, incomplete, cgpaDist, topSkills, topCompanies, collegeWise, yearWise },
        });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

/* GET /api/admin/analytics/drives */
router.get('/analytics/drives', async (req, res) => {
    try {
        // Company type breakdown
        const typeBreakdown = await Drive.aggregate([
            { $group: { _id: '$companyType', count: { $sum: 1 } } },
        ]);

        // Avg CGPA cutoff
        const avgCutoff = await Drive.aggregate([
            { $match: { cgpaCutoff: { $gt: 0 } } },
            { $group: { _id: null, avg: { $avg: '$cgpaCutoff' } } },
        ]);

        // Expiring in 7 days
        const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const expiring = await Drive.find({
            deadline: { $gte: new Date(), $lte: sevenDays },
            status: { $ne: 'closed' },
        }).sort({ deadline: 1 }).limit(10);

        // Most competitive (most applications)
        const competitive = await Application.aggregate([
            { $group: { _id: '$drive', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'drives', localField: '_id', foreignField: '_id', as: 'drive' } },
            { $unwind: { path: '$drive', preserveNullAndEmptyArrays: true } },
        ]);

        // Status breakdown
        const statusBreakdown = await Drive.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        res.json({
            success: true,
            data: {
                typeBreakdown, avgCutoff: avgCutoff[0]?.avg?.toFixed(1) || '0',
                expiring, competitive, statusBreakdown,
            },
        });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});


/* ════════════════════════════════════
   USERS / STUDENTS
═════════════════════════════════════ */
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }).select('-password');
        res.json({ success: true, total: users.length, users });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/users/:id/role', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        await logAction(req.user._id, 'user.role_change', `${user.firstName} ${user.lastName}`, { newRole: req.body.role });
        res.json({ success: true, user });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Legacy PUT /users/:id (for promote button compat)
router.put('/users/:id', async (req, res) => {
    try {
        const update = {};
        if (req.body.role) update.role = req.body.role;
        const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        await logAction(req.user._id, 'user.update', `${user.firstName} ${user.lastName}`, update);
        res.json({ success: true, user });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        await User.findByIdAndDelete(req.params.id);
        await logAction(req.user._id, 'user.delete', `${user.firstName} ${user.lastName}`, { email: user.email });
        res.json({ success: true, message: 'User deleted.' });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

/* Enhanced student endpoints */
router.get('/students/export', async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password').lean();
        res.json({ success: true, total: students.length, students });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/students/incomplete', async (req, res) => {
    try {
        const students = await User.find({
            role: 'student',
            $or: [
                { college: { $in: [null, ''] } },
                { branch: { $in: [null, ''] } },
                { cgpa: { $in: [null, 0] } },
                { year: { $in: [null, ''] } },
            ],
        }).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, total: students.length, students });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/students/cgpa-filter', async (req, res) => {
    try {
        const min = parseFloat(req.query.min) || 0;
        const max = parseFloat(req.query.max) || 10;
        const students = await User.find({
            role: 'student',
            cgpa: { $gte: min, $lte: max },
        }).select('-password').sort({ cgpa: -1 });
        res.json({ success: true, total: students.length, students });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/students/:id/profile', async (req, res) => {
    try {
        const student = await User.findById(req.params.id).select('-password');
        if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
        // Get their applications
        const applications = await Application.find({ student: req.params.id })
            .populate('drive', 'company role status').sort({ createdAt: -1 });
        res.json({ success: true, student, applications });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/students/:id/verify', async (req, res) => {
    try {
        const student = await User.findByIdAndUpdate(
            req.params.id,
            { isVerified: true },
            { new: true }
        ).select('-password');
        if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
        await logAction(req.user._id, 'user.verify', `${student.firstName} ${student.lastName}`);
        res.json({ success: true, student });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});


/* ════════════════════════════════════
   DRIVES (MongoDB CRUD)
═════════════════════════════════════ */
router.get('/drives', async (req, res) => {
    try {
        const drives = await Drive.find().sort({ createdAt: -1 });
        res.json({ success: true, total: drives.length, drives });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/drives/expiring', async (req, res) => {
    try {
        const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const drives = await Drive.find({
            deadline: { $gte: new Date(), $lte: sevenDays },
            status: { $ne: 'closed' },
        }).sort({ deadline: 1 });
        res.json({ success: true, total: drives.length, drives });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/drives', async (req, res) => {
    try {
        const newDrive = await Drive.create({
            id: `drive_manual_${Date.now()}`,
            ...req.body,
            source: 'manual',
            postedBy: req.user._id,
        });

        // Increment unread count for all students
        try {
            await Notification.updateMany({}, { $inc: { unreadDrivesCount: 1 } });
        } catch (notifErr) {
            console.warn('Notification update skipped:', notifErr.message);
        }

        await logAction(req.user._id, 'drive.create', `${newDrive.company} — ${newDrive.role}`);

        // Create a System Post for the Student Feed
        try {
            await Post.create({
                author: req.user._id,
                content: `New Placement Drive Launched: ${newDrive.company} is hiring for ${newDrive.role}. Package: ${newDrive.package || 'Competitive'}.`,
                type: 'drive',
                isSystem: true,
                isPinned: true,
                meta: {
                    company: newDrive.company,
                    role: newDrive.role,
                    package: newDrive.package,
                    deadline: newDrive.deadline
                }
            });
        } catch (postErr) { console.error('Drive Post Error:', postErr.message); }

        res.status(201).json({ success: true, drive: newDrive });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/drives/:id', async (req, res) => {
    try {
        const paramId = req.params.id;
        const drive = await Drive.findOneAndUpdate(
            {
                $or: [
                    { id: paramId },
                    ...(mongoose.Types.ObjectId.isValid(paramId) ? [{ _id: paramId }] : []),
                ],
            },
            req.body,
            { new: true }
        );
        if (!drive) return res.status(404).json({ success: false, message: 'Drive not found.' });
        await logAction(req.user._id, 'drive.update', `${drive.company} — ${drive.role}`);
        res.json({ success: true, drive });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/drives/:id/close', async (req, res) => {
    try {
        const paramId = req.params.id;
        const drive = await Drive.findOneAndUpdate(
            { $or: [{ id: paramId }, ...(mongoose.Types.ObjectId.isValid(paramId) ? [{ _id: paramId }] : [])] },
            { status: 'closed' },
            { new: true }
        );
        if (!drive) return res.status(404).json({ success: false, message: 'Drive not found.' });
        await logAction(req.user._id, 'drive.close', `${drive.company} — ${drive.role}`);
        res.json({ success: true, drive });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/drives/:id/feature', async (req, res) => {
    try {
        const paramId = req.params.id;
        const drive = await Drive.findOne({
            $or: [{ id: paramId }, ...(mongoose.Types.ObjectId.isValid(paramId) ? [{ _id: paramId }] : [])],
        });
        if (!drive) return res.status(404).json({ success: false, message: 'Drive not found.' });
        drive.isFeatured = !drive.isFeatured;
        await drive.save();
        await logAction(req.user._id, drive.isFeatured ? 'drive.feature' : 'drive.unfeature', `${drive.company} — ${drive.role}`);
        res.json({ success: true, drive });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/drives/:id', async (req, res) => {
    try {
        const paramId = req.params.id;
        const drive = await Drive.findOneAndDelete({
            $or: [
                { id: paramId },
                ...(mongoose.Types.ObjectId.isValid(paramId) ? [{ _id: paramId }] : []),
            ],
        });
        if (!drive) return res.status(404).json({ success: false, message: 'Drive not found.' });
        await logAction(req.user._id, 'drive.delete', `${drive.company} — ${drive.role}`);
        res.json({ success: true, message: 'Drive deleted.' });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/drives/bulk-close', async (req, res) => {
    try {
        const result = await Drive.updateMany(
            { deadline: { $lt: new Date() }, status: { $ne: 'closed' } },
            { $set: { status: 'closed' } }
        );
        await logAction(req.user._id, 'drive.bulk_close', `${result.modifiedCount} drives closed`);
        res.json({ success: true, closedCount: result.modifiedCount });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});


/* ════════════════════════════════════
   APPLICATIONS
═════════════════════════════════════ */
router.get('/applications', async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.drive) filter.drive = req.query.drive;

        const apps = await Application.find(filter)
            .populate('student', 'firstName lastName email branch college cgpa')
            .populate('drive', 'company role status companyType')
            .sort({ createdAt: -1 });

        // Get stats
        const total = await Application.countDocuments();
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const appliedToday = await Application.countDocuments({ createdAt: { $gte: todayStart } });
        const statusCounts = await Application.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        res.json({ success: true, total, appliedToday, statusCounts, applications: apps });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/applications/:id', async (req, res) => {
    try {
        const app = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('student', 'firstName lastName email')
            .populate('drive', 'company role');
        if (!app) return res.status(404).json({ success: false, message: 'Application not found.' });
        res.json({ success: true, application: app });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});


/* ════════════════════════════════════
   POSTS
═════════════════════════════════════ */
router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).limit(50).populate('author', 'firstName lastName email');
        res.json({ success: true, posts });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/posts/:id', async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        await logAction(req.user._id, 'post.delete', `Post ${req.params.id}`);
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


/* ════════════════════════════════════
   NOTIFICATIONS
═════════════════════════════════════ */
router.post('/notify', async (req, res) => {
    try {
        const { message, type, targetBranch, targetYear } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Message is required.' });

        // Create a system post as notification
        const post = await Post.create({
            author: req.user._id,
            type: type || 'announcement',
            content: message,
            isPinned: false,
            isSystem: true,
            meta: { targetBranch, targetYear },
        });

        await logAction(req.user._id, 'notification.send', message.slice(0, 80), { targetBranch, targetYear, type });
        res.json({ success: true, post });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});


/* ════════════════════════════════════
   REPORTS
═════════════════════════════════════ */
router.get('/reports/placement-summary', async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalDrives = await Drive.countDocuments();
        const openDrives = await Drive.countDocuments({ status: 'open' });
        const closedDrives = await Drive.countDocuments({ status: 'closed' });
        const totalApps = await Application.countDocuments();

        // Offers
        const offeredStudents = await Application.distinct('student', { status: 'offered' });
        const placementRate = totalStudents > 0 ? ((offeredStudents.length / totalStudents) * 100).toFixed(1) : '0';

        // Average package (if we had numeric packages, for now we count)
        // Top companies by applications
        const topCompanies = await Application.aggregate([
            { $group: { _id: '$drive', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'drives', localField: '_id', foreignField: '_id', as: 'drive' } },
            { $unwind: { path: '$drive', preserveNullAndEmptyArrays: true } },
            { $project: { count: 1, company: '$drive.company', role: '$drive.role', package: '$drive.package' } },
        ]);

        // Branch breakdown
        const branchBreakdown = await User.aggregate([
            { $match: { branch: { $exists: true, $ne: '' }, role: 'student' } },
            { $group: { _id: '$branch', total: { $sum: 1 }, avgCGPA: { $avg: '$cgpa' } } },
            { $sort: { total: -1 } },
        ]);

        // Company type distribution across drives
        const companyTypeDistribution = await Drive.aggregate([
            { $group: { _id: '$companyType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        res.json({
            success: true,
            report: {
                totalStudents, totalDrives, openDrives, closedDrives, totalApps,
                placedStudents: offeredStudents.length, placementRate,
                topCompanies, branchBreakdown, companyTypeDistribution,
                generatedAt: new Date().toISOString(),
            },
        });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});


/* ════════════════════════════════════
   ACTIVITY LOG
═════════════════════════════════════ */
router.get('/activity-log', async (req, res) => {
    try {
        const logs = await AdminLog.find()
            .populate('admin', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ success: true, logs });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});


/* ════════════════════════════════════
   SETTINGS — ADMIN MANAGEMENT
═════════════════════════════════════ */
router.get('/settings/admins', async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('firstName lastName email createdAt');
        res.json({ success: true, admins });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/settings/admins', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email required.' });
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ success: false, message: 'No user with that email found.' });
        if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Already an admin.' });
        user.role = 'admin';
        await user.save();
        await logAction(req.user._id, 'admin.add', `${user.firstName} ${user.lastName}`, { email });
        res.json({ success: true, admin: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/settings/admins/:id', async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot remove yourself as admin.' });
        }
        const user = await User.findByIdAndUpdate(req.params.id, { role: 'student' }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        await logAction(req.user._id, 'admin.remove', `${user.firstName} ${user.lastName}`);
        res.json({ success: true, message: 'Admin demoted to student.' });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});


/* ════════════════════════════════════
   SEARCH
═════════════════════════════════════ */
router.get('/search', async (req, res) => {
    try {
        const q = req.query.q;
        if (!q) return res.json({ success: true, students: [], drives: [], posts: [] });

        const regex = { $regex: q, $options: 'i' };

        const [students, drives, posts] = await Promise.all([
            User.find({ role: 'student', $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] }).select('firstName lastName email branch').limit(5),
            Drive.find({ $or: [{ company: regex }, { role: regex }] }).select('company role status').limit(5),
            Post.find({ content: regex }).select('content type createdAt').limit(5),
        ]);

        res.json({ success: true, students, drives, posts });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});


/* ════════════════════════════════════
   TRIGGER SCRAPER
═════════════════════════════════════ */
router.post('/scrape', async (req, res) => {
    try {
        const runScraper = require('../scraper/index');
        res.json({ success: true, message: 'Scraper started in background.' });
        runScraper().catch(console.error);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});


/* ════════════════════════════════════
   DANGER ZONE
═════════════════════════════════════ */
router.post('/settings/reset-drives', async (req, res) => {
    try {
        if (req.body.confirm !== 'CONFIRM') {
            return res.status(400).json({ success: false, message: 'Type CONFIRM to proceed.' });
        }
        const result = await Drive.deleteMany({});
        await logAction(req.user._id, 'settings.reset_drives', `${result.deletedCount} drives deleted`);
        res.json({ success: true, message: `${result.deletedCount} drives deleted.` });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});


/* ════════════════════════════════════
   ANNOUNCEMENTS
   System-wide targeted communications
   ═════════════════════════════════════ */
const Announcement = require('../models/Announcement');

router.post('/announcements', async (req, res) => {
    try {
        const { title, content, type, targetBranches } = req.body;
        
        // 1. Create the persistent Announcement log
        const announcement = await Announcement.create({
            title,
            content,
            type,
            targetBranches,
            admin: req.user._id
        });
        
        // 2. Create a System Post for the Student Feed
        const systemPost = await Post.create({
            author: req.user._id,
            content: `${title}\n\n${content}`,
            type: type === 'drive' ? 'drive' : 'announcement',
            isSystem: true,
            isPinned: true, // Announcements are usually important
            meta: {
                targetBranch: targetBranches && targetBranches.includes('All') ? null : (targetBranches && targetBranches[0]),
                // If more than one branch, we might need more complex meta, 
                // but for now we follow the filter logic in posts.js
            }
        });
        
        // Log this action
        await logAction(req.user._id, 'announcement.create', title);
        
        res.status(201).json({ success: true, announcement, post: systemPost });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/announcements', async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 }).populate('admin', 'firstName lastName');
        res.json({ success: true, announcements });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/announcements/:id', async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Announcement deleted.' });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;