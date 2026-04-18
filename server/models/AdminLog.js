/* ================================================================
   models/AdminLog.js — Audit trail for admin actions
   Every destructive or important admin action is logged here.
================================================================ */

const mongoose = require('mongoose');

const AdminLogSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            required: true,
            trim: true,
            // e.g. 'drive.create', 'drive.delete', 'user.delete', 'user.verify'
        },
        target: {
            type: String,
            trim: true,
            // Human-readable identifier, e.g. "Google — SDE Intern"
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
            // Extra context (the drive object, user email, etc.)
        },
    },
    { timestamps: true }
);

AdminLogSchema.index({ createdAt: -1 });
AdminLogSchema.index({ admin: 1, createdAt: -1 });

module.exports = mongoose.model('AdminLog', AdminLogSchema);
