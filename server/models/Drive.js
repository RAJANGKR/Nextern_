const mongoose = require('mongoose');

const DriveSchema = new mongoose.Schema(
    {
        company: { type: String, required: true, trim: true },
        role: { type: String, required: true, trim: true },
        location: { type: String, trim: true },
        ctc: { type: String, trim: true },
        deadline: { type: Date },
        eligibility: { type: String, trim: true },
        applyUrl: { type: String, trim: true },
        sourceUrl: { type: String, trim: true },
        sourceType: {
            type: String,
            enum: ['scraped', 'manual'],
            default: 'scraped',
        },
        postedAt: { type: Date },
        isVerified: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ['draft', 'published', 'closed'],
            default: 'published',
        },
        externalId: { type: String, trim: true },
        dedupeKey: { type: String, required: true, unique: true, index: true },
        rawSource: { type: mongoose.Schema.Types.Mixed },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

DriveSchema.index({ company: 1, role: 1 });
DriveSchema.index({ status: 1, deadline: 1 });
DriveSchema.index({ sourceType: 1, createdAt: -1 });

module.exports = mongoose.model('Drive', DriveSchema);
