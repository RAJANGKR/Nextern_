/* ================================================================
   routes/posts.js

   GET  /api/posts          — fetch latest 15 posts
   POST /api/posts          — create a new post
   POST /api/posts/:id/like — like or unlike a post
================================================================ */

const express = require('express');
const Post = require('../models/post');
const protect = require('../middleware/protect');
const router = express.Router();

/* ================================================================
   GET /api/posts
   Returns latest 15 posts with author info populated
================================================================ */
router.get('/', protect, async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ isPinned: -1, createdAt: -1 })  // pinned first, then newest
            .limit(15)
            .populate('author', 'firstName lastName college branch year avatar');
        // TEACH: populate() replaces the author ObjectId with the actual
        // user document fields we specify. Like a JOIN in SQL.

        res.json({ success: true, posts });

    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

/* ================================================================
   POST /api/posts
   Create a new post
   Body: { content, type, meta }
================================================================ */
router.post('/', protect, async (req, res) => {
    try {
        const { content, type, meta } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: 'Post content is required.' });
        }

        const post = await Post.create({
            author: req.user._id,
            content: content.trim(),
            type: type || 'general',
            meta: meta || {},
        });

        // Populate author info before sending back
        await post.populate('author', 'firstName lastName college branch year avatar');

        res.status(201).json({ success: true, post });

    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

/* ================================================================
   POST /api/posts/:id/like
   Toggle like on a post
   TEACH: If user already liked → remove like (unlike)
          If user hasn't liked → add like
================================================================ */
router.post('/:id/like', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found.' });
        }

        const userId = req.user._id.toString();
        const alreadyLiked = post.likes.some(id => id.toString() === userId);

        if (alreadyLiked) {
            // Unlike — remove user from likes array
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else {
            // Like — add user to likes array
            post.likes.push(req.user._id);
        }

        await post.save();

        res.json({
            success: true,
            liked: !alreadyLiked,
            likes: post.likes.length,
        });

    } catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;