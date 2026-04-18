/* ================================================================
   routes/drives.js — Public drives API (read-only)
   GET /api/drives      — list & filter
   GET /api/drives/:id  — single drive detail
================================================================ */

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Drive = require('../models/Drive');

const protect = require('../middleware/protect');

/* GET /api/drives */
router.get('/', protect, async (req, res) => {
    try {
        const { role, cgpa, type, q, status, source } = req.query;

        // Build Mongoose filter object
        const filter = {};

        if (role) {
            filter.$or = [
                { role: { $regex: role, $options: 'i' } },
                { type: { $regex: role, $options: 'i' } },
            ];
        }

        if (cgpa) {
            const userCGPA = parseFloat(cgpa);
            if (!isNaN(userCGPA)) {
                filter.cgpaCutoff = { $lte: userCGPA };
            }
        }

        if (type) {
            filter.companyType = type;
        }

        if (q) {
            // If both 'role' and 'q' are provided, 'q' takes precedence for $or
            filter.$or = [
                { company: { $regex: q, $options: 'i' } },
                { role: { $regex: q, $options: 'i' } },
            ];
        }

        if (status) {
            filter.status = status;
        }

        if (source) {
            filter.source = { $regex: new RegExp(`^${source}$`, 'i') };
        }

        let drives = await Drive.find(filter).sort({ createdAt: -1 });

        // Calculate eligibility for students
        if (req.user && req.user.role === 'student') {
            const user = req.user;
            drives = drives.map(drive => {
                const driveObj = drive.toObject();
                
                // If targeting is specified, check it
                const branchMatch = !drive.targetBranches || drive.targetBranches.length === 0 || drive.targetBranches.includes(user.branch);
                const yearMatch = !drive.targetYear || drive.targetYear.length === 0 || drive.targetYear.includes(user.year);
                const cgpaMatch = !drive.cgpaCutoff || (user.cgpa && user.cgpa >= drive.cgpaCutoff);
                
                driveObj.isEligible = branchMatch && yearMatch && cgpaMatch;
                return driveObj;
            });
        }

        res.json({
            success: true,
            total: drives.length,
            drives,
        });
    } catch (error) {
        console.error('Drives fetch error:', error.message);
        res.status(500).json({ success: false, message: 'Server error fetching drives.' });
    }
});

/* GET /api/drives/:id */
router.get('/:id', async (req, res) => {
    try {
        const paramId = req.params.id;

        const drive = await Drive.findOne({
            $or: [
                { id: paramId },
                ...(mongoose.Types.ObjectId.isValid(paramId)
                    ? [{ _id: paramId }]
                    : []),
            ],
        });

        if (!drive) {
            return res.status(404).json({ success: false, message: 'Drive not found.' });
        }

        res.json({ success: true, drive });
    } catch (error) {
        console.error('Drive detail error:', error.message);
        res.status(500).json({ success: false, message: 'Server error fetching drive details.' });
    }
});

module.exports = router;
