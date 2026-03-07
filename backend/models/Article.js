const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true,
            unique: true,
        },
        title: {
            zh: { type: String, default: '' },
            en: { type: String, default: '' },
        },
        coverImage: {
            type: String,
            default: '',
        },
        date: {
            type: String,
            required: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        content: {
            zh: { type: String, default: '' },
            en: { type: String, default: '' },
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
