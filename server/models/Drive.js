/* ================================================================
   models/Drive.js — Mongoose schema for placement drives

   Single source-of-truth model used by:
     - routes/drives.js    (public read)
     - routes/admin.js     (CRUD)
     - scraper/index.js    (upsert scraped data)
     - scripts/migrateDrives.js (one-time migration)
================================================================ */

const mongoose = require('mongoose');

const DriveSchema = new mongoose.Schema(
    {
        // Legacy string ID for backwards-compat with frontend
        id: { type: String, index: true },

        company:     { type: String, required: true, trim: true },
        role:        { type: String, required: true, trim: true },
        location:    { type: String, trim: true },
        package:     { type: String, trim: true },
        cgpaCutoff:  { type: Number, default: 0 },
        deadline:    { type: Date },

        type: {
            type: String,
            enum: ['Full Time', 'Internship'],
            default: 'Full Time',
        },

        companyType: {
            type: String,
            enum: ['product', 'service', 'startup', 'finance'],
            default: 'product',
        },

        applyUrl: { type: String, trim: true },

        status: {
            type: String,
            enum: ['open', 'closing', 'closed'],
            default: 'open',
        },

        logo:   { type: String, trim: true },
        color:  { type: String, trim: true },
        source: { type: String, trim: true, default: 'manual' },

        // ── NEW: Targeting ──
        targetBranches: [{ type: String, trim: true }],
        targetYear:     [{ type: String, trim: true }],

        // ── NEW: Admin metadata ──
        postedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        isFeatured: { type: Boolean, default: false },
        adminNotes: { type: String, trim: true },

        // Extra metadata from scraper
        scrapedAt: { type: Date },
        postedAt:  { type: Date },
    },
    { timestamps: true }
);

/* ── Compound indexes ── */
DriveSchema.index({ company: 1, role: 1 });
DriveSchema.index({ status: 1, deadline: 1 });
DriveSchema.index({ source: 1, createdAt: -1 });

module.exports = mongoose.model('Drive', DriveSchema);
