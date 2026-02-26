require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Article = require('../models/Article');
const connectDB = require('../config/db');

connectDB();

const importData = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Article.deleteMany();

        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const adminUser = await User.create({
            username: 'admin',
            password: hashedPassword,
        });

        console.log('Admin user created (admin / password123)');

        // Import articles
        const dataPath = path.join(__dirname, '../data/articles.json');
        if (fs.existsSync(dataPath)) {
            const data = fs.readFileSync(dataPath, 'utf-8');
            const articles = JSON.parse(data);

            await Article.insertMany(articles);
            console.log('Articles imported successfully');
        } else {
            console.log('No articles.json found to import');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
