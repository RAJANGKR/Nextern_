const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const Application = require('../models/Application');
const Drive = require('../models/Drive');
const User = require('../models/User');
const Analysis = require('../models/analysis.model.js');
const TopicProgress = require('../models/TopicProgress');

/* ================================================================
   GET /api/analytics/placement
   College-wide placement trends and batch metrics.
================================================================ */
router.get('/placement', protect, async (req, res) => {
    try {
        // 1. Overall Placement Rate
        const totalStudents = await User.countDocuments({ role: 'student' });
        const placedStudents = await Application.distinct('student', { status: 'offered' });
        const placementRate = totalStudents > 0 ? (placedStudents.length / totalStudents) * 100 : 0;

        // 2. Average Package by Branch
        const branchPackages = await Application.aggregate([
            { $match: { status: 'offered' } },
            { $lookup: { from: 'drives', localField: 'drive', foreignField: '_id', as: 'driveData' } },
            { $unwind: '$driveData' },
            { $lookup: { from: 'users', localField: 'student', foreignField: '_id', as: 'studentData' } },
            { $unwind: '$studentData' },
            {
                $group: {
                    _id: '$studentData.branch',
                    avgPackage: { $avg: { $toDouble: { $replaceAll: { input: '$driveData.package', find: ' LPA', replacement: '' } } } }
                }
            }
        ]);

        // 3. Company Type Distribution
        const companyTypes = await Drive.aggregate([
            { $group: { _id: '$companyType', count: { $sum: 1 } } }
        ]);

        // 4. Monthly Drive Activity
        const monthlyActivity = await Drive.aggregate([
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // 5. Batch Averages (for comparison)
        const batchStats = await User.aggregate([
            { $match: { role: 'student' } },
            {
                $group: {
                    _id: null,
                    avgCgpa: { $avg: '$cgpa' },
                    totalStudents: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            stats: {
                placementRate,
                branchPackages,
                companyTypes,
                monthlyActivity,
                batchAvgCgpa: batchStats[0]?.avgCgpa || 0,
            }
        });
    } catch (error) {
        console.error('Placement Analytics Error:', error);
        res.status(500).json({ success: false, message: 'Error fetching placement analytics' });
    }
});

/* ================================================================
   GET /api/analytics/personal
   Current user's specific progress and comparison.
================================================================ */
router.get('/personal', protect, async (req, res) => {
    try {
        const studentId = req.user._id;

        // 1. Application Status Counts
        const appStatus = await Application.aggregate([
            { $match: { student: studentId } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // 2. Match Score History
        const matchHistory = await Analysis.find({ studentId })
            .select('matchScore driveTitle createdAt')
            .sort({ createdAt: 1 });

        // 3. Prep Progress
        // Hardcoded topic count for now, or fetch from Topic model if exists
        const totalTopics = 150; // Approximated
        const completedCount = await TopicProgress.countDocuments({ user: studentId, completed: true });
        const prepPercent = (completedCount / totalTopics) * 100;

        // 4. Personal vs Batch Rank (CGPA)
        const user = await User.findById(studentId);
        const higherCgpaCount = await User.countDocuments({ role: 'student', cgpa: { $gt: user.cgpa } });
        const totalStudents = await User.countDocuments({ role: 'student' });
        const cgpaPercentile = totalStudents > 0 ? ((totalStudents - higherCgpaCount) / totalStudents) * 100 : 0;

        res.json({
            success: true,
            personal: {
                applications: appStatus,
                matchHistory,
                prepPercent,
                cgpa: user.cgpa,
                cgpaPercentile
            }
        });
    } catch (error) {
        console.error('Personal Analytics Error:', error);
        res.status(500).json({ success: false, message: 'Error fetching personal analytics' });
    }
});

module.exports = router;
