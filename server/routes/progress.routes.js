const express = require('express');
const router = express.Router();
const Progress = require('../models/progress.model');
const protect = require('../middleware/protect');

// @route   POST /api/progress/toggle
// @desc    Toggle a topic completion
// @access  Private
router.post('/toggle', protect, async (req, res) => {
    try {
        const { topicCode } = req.body;
        const studentId = req.user._id;

        if (!topicCode) {
            return res.status(400).json({ success: false, message: 'Topic code is required.' });
        }

        let progress = await Progress.findOne({ studentId });

        if (!progress) {
            progress = new Progress({ studentId, completedTopics: [topicCode] });
            await progress.save();
            return res.json({ success: true, completed: true, topics: progress.completedTopics });
        }

        const index = progress.completedTopics.indexOf(topicCode);
        let isCompleted = false;

        if (index === -1) {
            progress.completedTopics.push(topicCode);
            isCompleted = true;
        } else {
            progress.completedTopics.splice(index, 1);
            isCompleted = false;
        }

        await progress.save();
        res.json({ success: true, completed: isCompleted, topics: progress.completedTopics });
    } catch (error) {
        console.error('Progress toggle error:', error.message);
        res.status(500).json({ success: false, message: 'Server error toggling progress.' });
    }
});

// @route   GET /api/progress/:studentId
// @desc    Get completed topics for a student
// @access  Private
router.get('/:studentId', protect, async (req, res) => {
    try {
        const progress = await Progress.findOne({ studentId: req.params.studentId });
        res.json({ 
            success: true, 
            completedTopics: progress ? progress.completedTopics : [] 
        });
    } catch (error) {
        console.error('Fetch progress error:', error.message);
        res.status(500).json({ success: false, message: 'Server error fetching progress.' });
    }
});

module.exports = router;
