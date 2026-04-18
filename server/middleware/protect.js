/* ================================================================
   middleware/protect.js — JWT Auth Middleware

   Verifies JWT token from Authorization header, attaches user
   to req.user, and updates lastActive timestamp.
================================================================ */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    // Header format: "Authorization: Bearer eyJhbGci..."
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // No token found
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorised. Please log in.',
        });
    }

    try {
        // Verify token — throws error if expired or invalid
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request (without password)
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Please log in again.',
            });
        }

        // Update lastActive (non-blocking — don't await)
        User.updateOne(
            { _id: req.user._id },
            { $set: { lastActive: new Date() } }
        ).catch(() => {});

        next(); // Token is valid — proceed to route handler

    } catch (error) {
        console.error('JWT Verify Error:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Token invalid or expired. Please log in again.',
        });
    }
};

module.exports = protect;