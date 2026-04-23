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

function computeProfileComplete(payload = {}) {
    const requiredText = ['firstName', 'lastName', 'college', 'branch', 'year'];
    const hasRequiredText = requiredText.every((key) => {
        const v = payload[key];
        return typeof v === 'string' && v.trim().length > 0;
    });
    const hasValidCgpa = typeof payload.cgpa === 'number' && payload.cgpa > 0;
    const hasSkills = Array.isArray(payload.skills) && payload.skills.length > 0;

    return hasRequiredText && hasValidCgpa && hasSkills;
}


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
                gender: user.gender,
                dob: user.dob,
                city: user.city,
                state: user.state,
                country: user.country,
                bio: user.bio,
                college: user.college,
                branch: user.branch,
                year: user.year,
                cgpa: user.cgpa,
                graduationYear: user.graduationYear,
                tenthPercent: user.tenthPercent,
                twelfthPercent: user.twelfthPercent,
                activeBacklogs: user.activeBacklogs,
                internships: user.internships,
                projects: user.projects,
                skills: user.skills,
                languages: user.languages,
                certifications: user.certifications,
                targetCompanies: user.targetCompanies,
                preferredRoles: user.preferredRoles,
                preferredLocations: user.preferredLocations,
                openToRelocate: user.openToRelocate,
                linkedin: user.linkedin,
                github: user.github,
                portfolio: user.portfolio,
                leetcode: user.leetcode,
                avatar: user.avatar,
                googleId: user.googleId ? true : false,
                role: user.role,
                isProfileComplete: user.isProfileComplete,
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
            'gender', 'dob', 'city', 'state', 'country', 'bio',
            'college', 'branch', 'year', 'cgpa', 'graduationYear',
            'tenthPercent', 'twelfthPercent', 'activeBacklogs', 'internships', 'projects',
            'skills', 'languages', 'certifications',
            'targetCompanies', 'preferredRoles', 'preferredLocations', 'openToRelocate',
            'linkedin', 'github', 'portfolio', 'leetcode'
        ];

        const updates = {};
        allowed.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const current = await User.findById(req.user._id).lean();
        const mergedForCompleteness = {
            ...(current || {}),
            ...updates,
        };
        updates.isProfileComplete = computeProfileComplete(mergedForCompleteness);

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
