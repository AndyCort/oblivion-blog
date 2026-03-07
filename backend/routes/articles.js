const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { protect } = require('../middleware/auth');

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
router.get('/', async (req, res) => {
    try {
        const articles = await Article.find({ isPublished: true }).sort({ id: -1 });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load articles' });
    }
});

// @desc    Get all articles (including drafts)
// @route   GET /api/articles/all
// @access  Private
router.get('/all', protect, async (req, res) => {
    try {
        const articles = await Article.find().sort({ id: -1 });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load articles' });
    }
});

// @desc    Get single article by id
// @route   GET /api/articles/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const article = await Article.findOne({ id: parseInt(req.params.id), isPublished: true });

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.json(article);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load article' });
    }
});

// @desc    Search articles
// @route   GET /api/articles/search/:query
// @access  Public
router.get('/search/:query', async (req, res) => {
    try {
        const query = req.params.query.toLowerCase();

        // Perform a simple regex search across relevant fields
        const articles = await Article.find({
            isPublished: true,
            $or: [
                { 'title.zh': { $regex: query, $options: 'i' } },
                { 'title.en': { $regex: query, $options: 'i' } },
                { 'content.zh': { $regex: query, $options: 'i' } },
                { 'content.en': { $regex: query, $options: 'i' } },
            ],
        });

        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});

// @desc    Create new article
// @route   POST /api/articles
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { title, coverImage, date, tags, content, isPublished } = req.body;

        // Generate a simple auto-increment ID for compatibility with previous logic
        const lastArticle = await Article.findOne().sort({ id: -1 });
        const newId = lastArticle ? lastArticle.id + 1 : 1;

        const article = await Article.create({
            id: newId,
            title,
            coverImage,
            date,
            tags,
            content,
            isPublished: isPublished !== undefined ? isPublished : true,
        });

        res.status(201).json(article);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create article', details: error.message });
    }
});

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const article = await Article.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            req.body,
            { new: true, runValidators: true }
        );

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.json(article);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update article', details: error.message });
    }
});

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const article = await Article.findOneAndDelete({ id: parseInt(req.params.id) });

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.json({ message: 'Article removed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete article' });
    }
});

module.exports = router;
