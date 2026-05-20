const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for photo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Get content by section (Public)
router.get('/:section', async (req, res) => {
    try {
        const content = await Content.findOne({ section: req.params.section });
        res.json(content || { section: req.params.section, data: {} });
    } catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all content (Public)
router.get('/', async (req, res) => {
    try {
        const allContent = await Content.find();
        const contentMap = {};
        allContent.forEach(item => {
            contentMap[item.section] = item.data;
        });
        res.json(contentMap);
    } catch (error) {
        console.error('Get all content error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update content (Admin only)
router.put('/:section', authMiddleware, async (req, res) => {
    try {
        const { section } = req.params;
        const { data } = req.body;
        
        let content = await Content.findOne({ section });
        
        if (content) {
            content.data = data;
            content.updatedAt = Date.now();
            await content.save();
        } else {
            content = new Content({ section, data });
            await content.save();
        }
        
        res.json({ message: 'Content updated successfully', content });
    } catch (error) {
        console.error('Update content error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Upload photo for About section (Admin only)
router.post('/upload-photo', authMiddleware, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No photo uploaded' });
        }
        
        const photoUrl = '/uploads/' + req.file.filename;
        res.json({ message: 'Photo uploaded successfully', photoUrl });
    } catch (error) {
        console.error('Upload photo error:', error);
        res.status(500).json({ message: 'Failed to upload photo' });
    }
});

module.exports = router;
