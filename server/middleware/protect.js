/* ================================================================
   middleware/protect.js — JWT Auth Middleware

   TEACH: Middleware is a function that runs BETWEEN the request
   arriving and the route handler running.

   Express middleware signature: (req, res, next) => {}
   - req  = the incoming request
   - res  = the response we'll send back
   - next = function to call to move to the next middleware/route

   We use this middleware on any route that requires login.
   Example: router.get('/me', protect, getUserProfile)
   The 'protect' middleware runs first, checks the token,
   then calls next() to let getUserProfile run.

   JWT Flow:
   1. User logs in → server creates token → sends to client
   2. Client stores token in localStorage
   3. Client sends token in every request: Authorization: Bearer <token>
   4. This middleware reads and verifies the token
   5. If valid, attaches user ID to req.user
   6. Route handler can then use req.user to know who's asking
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

        next(); // Token is valid — proceed to route handler

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token invalid or expired. Please log in again.',
        });
    }
};

module.exports = protect;