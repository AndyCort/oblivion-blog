const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true,
            unique: true,
        },
        title: {
            zh: { type: String, required: true },
            en: { type: String, required: true },
        },
        date: {
            type: String,
            required: true,
        },
        tags: {
            type: [String],
            required: true,
        },
        content: {
            zh: { type: String, required: true },
            en: { type: String, required: true },
        },
        isPublished: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
    }
);

const Article = mongoose.model('Article', articleSchema);
module.exports = Article;
