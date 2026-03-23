const isEmailInAdminList = (email) => {
    const list = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map(item => item.trim().toLowerCase())
        .filter(Boolean);

    if (!list.length) return false;
    return list.includes(String(email || '').toLowerCase());
};

const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorised.' });
    }

    if (req.user.isAdmin || isEmailInAdminList(req.user.email)) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: 'Admin access required.',
    });
};

module.exports = adminOnly;
