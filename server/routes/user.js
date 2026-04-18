/* ================================================================
   routes/user.js

   Endpoints:
   GET  /api/user/me        — get logged-in user's profile
   PUT  /api/user/me        — update profile

   All routes here are protected — require JWT token.
================================================================ */

const express = require('express');
const User = require('../models/User');
const protect = require('../middleware/protect');
const router = express.Router();


/* ----------------------------------------------------------------
   GET /api/user/me
   Returns the logged-in user's profile.
   Frontend calls this on dashboard/feed load to get user data.
---------------------------------------------------------------- */
router.get('/me', protect, async (req, res) => {
    try {
        // req.user is set by the protect middleware
        const user = await User.findById(req.user._id);

        res.json({
            success: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                college: user.college,
                branch: user.branch,
                year: user.year,
                cgpa: user.cgpa,
                graduationYear: user.graduationYear,
                skills: user.skills,
                targetCompanies: user.targetCompanies,
                linkedin: user.linkedin,
                github: user.github,
                avatar: user.avatar,
                role: user.role,
                createdAt: user.createdAt,
            },
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});


/* ----------------------------------------------------------------
   PUT /api/user/me
   Update profile fields.
   Body: any fields from the user schema to update.
---------------------------------------------------------------- */
router.put('/me', protect, async (req, res) => {
    try {
        // Fields allowed to update (exclude sensitive ones like email/password)
        const allowed = [
            'firstName', 'lastName', 'phone',
            'college', 'branch', 'year', 'cgpa', 'graduationYear',
            'skills', 'targetCompanies', 'linkedin', 'github'
        ];

        const updates = {};
        allowed.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }  // new:true returns updated doc
        );

        res.json({
            success: true,
            user,
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});


module.exports = router;
