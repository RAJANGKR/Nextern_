const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    completedTopics: [{
        type: String // We'll store topic IDs/Codes as strings
    }]
}, { timestamps: true });

module.exports = mongoose.model('Progress', ProgressSchema);
