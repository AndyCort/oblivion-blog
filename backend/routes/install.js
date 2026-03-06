const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '../.env');

// Helper: check if .env exists and has been configured by the installer
const isInstalled = () => {
    // Support cloud platforms (e.g. Render) where env vars are set via dashboard
    if (process.env.INSTALLED === 'true') return true;
    if (!fs.existsSync(ENV_PATH)) return false;
    const content = fs.readFileSync(ENV_PATH, 'utf-8');
    return content.includes('INSTALLED=true');
};

// @desc    Check installation status
// @route   GET /api/install/status
// @access  Public
router.get('/status', (req, res) => {
    res.json({ installed: isInstalled() });
});

// @desc    Test a MongoDB connection URI
// @route   POST /api/install/test-db
// @access  Public
router.post('/test-db', async (req, res) => {
    const { mongoUri } = req.body;
    if (!mongoUri) {
        return res.status(400).json({ error: 'MongoDB URI is required' });
    }

    let testConn;
    try {
        testConn = await mongoose.createConnection(mongoUri).asPromise();
        await testConn.close();
        res.json({ success: true, message: '数据库连接成功！' });
    } catch (err) {
        if (testConn) {
            try { await testConn.close(); } catch (_) { }
        }
        res.status(400).json({ success: false, error: `连接失败：${err.message}` });
    }
});

// @desc    Run the full installation
// @route   POST /api/install/run
// @access  Public
router.post('/run', async (req, res) => {
    // Prevent reinstallation
    if (isInstalled()) {
        return res.status(403).json({ error: '博客已安装，禁止重复安装' });
    }

    const { mongoUri, jwtSecret, username, password, siteTitle, siteSubtitle } = req.body;

    // Validate required fields
    if (!mongoUri || !username || !password) {
        return res.status(400).json({ error: '缺少必填字段：mongoUri, username, password' });
    }

    try {
        // 1. Connect to the provided DB URI
        await mongoose.connect(mongoUri);

        // 2. Create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const User = require('../models/User');
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            await mongoose.disconnect();
            return res.status(400).json({ error: `用户名 "${username}" 已存在` });
        }
        await User.create({ username, password: hashedPassword });

        // 3. Create initial site settings
        const Settings = require('../models/Settings');
        await Settings.deleteMany({}); // clean slate
        await Settings.create({
            siteTitle: siteTitle || 'Oblivion Blog',
            siteSubtitle: siteSubtitle || 'A personal space for code and life',
        });

        // 4. Write .env file
        const secret = jwtSecret || require('crypto').randomBytes(32).toString('hex');
        const envContent = [
            `PORT=${process.env.PORT || 3001}`,
            `MONGO_URI=${mongoUri}`,
            `JWT_SECRET=${secret}`,
            `INSTALLED=true`,
        ].join('\n') + '\n';

        fs.writeFileSync(ENV_PATH, envContent, 'utf-8');

        // 5. Update process env so the running server picks up changes without restart
        process.env.MONGO_URI = mongoUri;
        process.env.JWT_SECRET = secret;
        process.env.INSTALLED = 'true';

        res.json({ success: true, message: '安装成功！请使用管理员账号登录。' });
    } catch (err) {
        try { await mongoose.disconnect(); } catch (_) { }
        res.status(500).json({ error: `安装失败：${err.message}` });
    }
});

module.exports = router;
module.exports.isInstalled = isInstalled;
