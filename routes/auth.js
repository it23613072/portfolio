const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find admin
        let admin = await Admin.findOne({ username });
        
        // If no admin exists, create default admin (first-time setup)
        if (!admin) {
            admin = new Admin({
                username: process.env.ADMIN_USERNAME || 'admin',
                password: process.env.ADMIN_PASSWORD || 'admin123',
                email: process.env.EMAIL_USER || 'admin@example.com'
            });
            await admin.save();
        }
        
        // Check if credentials match
        const isMatch = await admin.comparePassword(password);
        if (!isMatch || admin.username !== username) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Create token
        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '24h' }
        );
        
        req.session.token = token;
        
        res.json({
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
});

// Change password
router.post('/change-password', async (req, res) => {
    try {
        const { username, oldPassword, newPassword } = req.body;
        
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        
        const isMatch = await admin.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect old password' });
        }
        
        admin.password = newPassword;
        await admin.save();
        
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
