/* ================================================================
   models/Application.js — Student applications to drives
   Tracks which students applied to which drives + status pipeline.
================================================================ */

const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        drive: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Drive',
            required: true,
        },
        status: {
            type: String,
            enum: ['applied', 'shortlisted', 'test', 'interview', 'offered', 'rejected'],
            default: 'applied',
        },
        notes: { type: String, trim: true },          // admin-facing notes
        studentNotes: { type: String, trim: true },    // student-facing notes
    },
    { timestamps: true }
);

// A student can only apply once per drive
ApplicationSchema.index({ student: 1, drive: 1 }, { unique: true });
ApplicationSchema.index({ drive: 1, status: 1 });
ApplicationSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model('Application', ApplicationSchema);
