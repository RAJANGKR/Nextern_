const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Drive = require('../models/Drive');
const protect = require('../middleware/protect');

// @route   POST /api/applications/:driveId
// @desc    Apply for a drive
// @access  Private (Student)
router.post('/:driveId', protect, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ success: false, message: 'Only students can apply for drives.' });
        }

        const driveId = req.params.driveId;
        const drive = await Drive.findById(driveId);
        if (!drive) return res.status(404).json({ success: false, message: 'Drive not found.' });

        // Check if already applied
        const existing = await Application.findOne({ student: req.user._id, drive: driveId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You have already applied for this drive.' });
        }

        const application = await Application.create({
            student: req.user._id,
            drive: driveId,
            status: 'applied'
        });

        res.json({ success: true, application });
    } catch (error) {
        console.error('Apply error:', error);
        res.status(500).json({ success: false, message: 'Server error applying for drive.' });
    }
});

// @route   GET /api/applications/me
// @desc    Get logged-in user's applications
// @access  Private (Student)
router.get('/me', protect, async (req, res) => {
    try {
        const applications = await Application.find({ student: req.user._id })
            .populate('drive')
            .sort({ createdAt: -1 });

        res.json({ success: true, applications });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching applications.' });
    }
});

module.exports = router;
