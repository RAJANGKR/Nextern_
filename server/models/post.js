/* ================================================================
   models/Post.js
   Defines the shape of a post in MongoDB

   TEACH: A post has:
   - author: reference to User (MongoDB ObjectId)
   - type: what kind of post (drive, tip, progress)
   - content: the text
   - likes: array of user IDs who liked it
   - timestamps: createdAt, updatedAt (auto)
================================================================ */

const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({

    // Who wrote this post
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // links to User model
        required: true,
    },

    // Type of post
    type: {
        type: String,
        enum: ['drive', 'tip', 'progress', 'announcement', 'general'],
        default: 'general',
    },

    // Main content
    content: {
        type: String,
        required: true,
        maxlength: 1000,
    },

    // Optional metadata based on type
    meta: {
        // For drive posts
        company: { type: String },
        role: { type: String },
        applyUrl: { type: String },
        deadline: { type: String },
        package: { type: String },

        // For progress posts
        milestone: { type: String },
        progress: { type: Number },

        // For tip posts
        tag: { type: String },
    },

    // Array of user IDs who liked this post
    // TEACH: Storing IDs in array is a common MongoDB pattern
    // We can check if a user liked it with: likes.includes(userId)
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    // Is this post pinned to top?
    isPinned: { type: Boolean, default: false },

    // Is this a system-generated post (drive alert etc)?
    isSystem: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);