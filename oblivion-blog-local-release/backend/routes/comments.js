const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// @desc    Get comments for a specific article
// @route   GET /api/comments/:articleId
// @access  Public
router.get('/:articleId', async (req, res) => {
    try {
        const comments = await Comment.find({ articleId: req.params.articleId }).sort({ date: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load comments' });
    }
});

// @desc    Post a new comment
// @route   POST /api/comments
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { articleId, author, content } = req.body;

        if (!articleId || !content) {
            return res.status(400).json({ error: 'Article ID and Content are required' });
        }

        const newComment = new Comment({
            articleId,
            author: author || 'Anonymous',
            content
        });

        const savedComment = await newComment.save();
        res.status(201).json(savedComment);
    } catch (error) {
        res.status(400).json({ error: 'Failed to post comment', details: error.message });
    }
});

module.exports = router;
