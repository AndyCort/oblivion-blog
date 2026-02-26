const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        articleId: {
            type: String, // Storing as String to match the custom string IDs we use for articles
            required: true,
            index: true
        },
        author: {
            type: String,
            required: true,
            default: 'Anonymous'
        },
        content: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
