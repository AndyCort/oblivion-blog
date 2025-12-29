const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/articles.json');

// Get all articles
router.get('/', (req, res) => {
    try {
        const data = fs.readFileSync(dataPath, 'utf-8');
        const articles = JSON.parse(data);
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load articles' });
    }
});

// Get single article by id
router.get('/:id', (req, res) => {
    try {
        const data = fs.readFileSync(dataPath, 'utf-8');
        const articles = JSON.parse(data);
        const article = articles.find(a => a.id === parseInt(req.params.id));

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.json(article);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load article' });
    }
});

// Search articles
router.get('/search/:query', (req, res) => {
    try {
        const data = fs.readFileSync(dataPath, 'utf-8');
        const articles = JSON.parse(data);
        const query = req.params.query.toLowerCase();

        const results = articles.filter(article =>
            article.title.zh.toLowerCase().includes(query) ||
            article.title.en.toLowerCase().includes(query) ||
            article.content.zh.toLowerCase().includes(query) ||
            article.content.en.toLowerCase().includes(query)
        );

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});

module.exports = router;
