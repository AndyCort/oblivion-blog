const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
    {
        siteTitle: {
            type: String,
            default: 'Oblivion Blog',
        },
        siteSubtitle: {
            type: String,
            default: 'A personal space for code and life',
        },
        footerText: {
            type: String,
            default: '© 2026 Oblivion Blog. All rights reserved.',
        },
        aboutContent: {
            type: String,
            default: 'Welcome to my digital garden. Here you will find my thoughts, ideas, and various other things.',
        },
        aboutAvatar: {
            type: String,
            default: '🧑‍💻',
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
