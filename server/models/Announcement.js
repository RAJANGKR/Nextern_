const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    targetBranches: {
        type: [String],
        default: ['All'] // e.g. ['CS', 'IT'] or ['All']
    },
    targetYears: {
        type: [Number], // e.g. [1, 2, 3, 4] for 1st year, etc.
        default: []
    },
    type: {
        type: String,
        enum: ['drive', 'update', 'event', 'general'],
        default: 'general'
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
