const express = require('express');
const router = express.Router();
const Notification = require('../models/notification.model');
const protect = require('../middleware/protect');

// @route   GET /api/notifications/:studentId
// @desc    Get unread drives count
// @access  Private
router.get('/:studentId', protect, async (req, res) => {
    try {
        const notif = await Notification.findOne({ studentId: req.params.studentId });
        res.json({
            success: true,
            unreadDrivesCount: notif ? notif.unreadDrivesCount : 0
        });
    } catch (error) {
        console.error('Fetch notification error:', error.message);
        res.status(500).json({ success: false, message: 'Server error fetching notifications.' });
    }
});

// @route   POST /api/notifications/reset
// @desc    Reset unread count to 0
// @access  Private
router.post('/reset', protect, async (req, res) => {
    try {
        const studentId = req.user._id;
        let notif = await Notification.findOne({ studentId });

        if (!notif) {
            notif = new Notification({ studentId, unreadDrivesCount: 0 });
        } else {
            notif.unreadDrivesCount = 0;
        }

        await notif.save();
        res.json({ success: true, message: 'Notification count reset.' });
    } catch (error) {
        console.error('Reset notification error:', error.message);
        res.status(500).json({ success: false, message: 'Server error resetting notifications.' });
    }
});

module.exports = router;
