const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check for user email
        const user = await User.findOne({ username });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                username: user.username,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error during login' });
    }
});

// @desc    Update credentials
// @route   PUT /api/auth/credentials
// @access  Private
router.put('/credentials', protect, async (req, res) => {
    try {
        const { currentPassword, newUsername, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        if (!(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Update username if provided
        if (newUsername && newUsername !== user.username) {
            // Check if username already exists
            const existingUser = await User.findOne({ username: newUsername });
            if (existingUser && existingUser.id !== user.id) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            user.username = newUsername;
        }

        // Update password if provided
        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();

        res.json({
            _id: user.id,
            username: user.username,
            token: generateToken(user._id),
            message: 'Credentials updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating credentials' });
    }
});

module.exports = router;
