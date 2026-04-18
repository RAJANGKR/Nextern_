/* ================================================================
   models/analysis.model.js
   Stores the result of an AI resume analysis for a student + drive.
================================================================ */

const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    driveId: {
        type: String,  // Drive IDs are strings from drives.json
        required: true,
    },
    driveTitle: {
        type: String,
        default: '',
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
    },
    summary: {
        type: String,
        default: '',
    },
    presentSkills: {
        type: [String],
        default: [],
    },
    missingSkills: {
        type: [String],
        default: [],
    },
    strengths: {
        type: [String],
        default: [],
    },
    improvements: {
        type: [String],
        default: [],
    },
    resumeTips: {
        type: [String],
        default: [],
    },
    studyTopics: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Analysis', analysisSchema);