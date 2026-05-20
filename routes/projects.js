const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/auth');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and videos are allowed'));
        }
    }
});

// Get all projects (Public)
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort({ order: 1, createdAt: -1 });
        res.json(projects);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single project (Public)
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create project (Admin only)
router.post('/', authMiddleware, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]), async (req, res) => {
    try {
        const { title, description, technologies, featured, order } = req.body;
        
        const projectData = {
            title,
            description,
            technologies: technologies ? JSON.parse(technologies) : [],
            featured: featured === 'true',
            order: order || 0
        };
        
        if (req.files['video']) {
            projectData.video = '/uploads/' + req.files['video'][0].filename;
        }
        
        if (req.files['images']) {
            projectData.images = req.files['images'].map(file => '/uploads/' + file.filename);
        }
        
        const project = new Project(projectData);
        await project.save();
        
        res.json({ message: 'Project created successfully', project });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update project (Admin only)
router.put('/:id', authMiddleware, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        const { title, description, technologies, featured, order } = req.body;
        
        project.title = title || project.title;
        project.description = description || project.description;
        project.technologies = technologies ? JSON.parse(technologies) : project.technologies;
        project.featured = featured !== undefined ? featured === 'true' : project.featured;
        project.order = order !== undefined ? order : project.order;
        
        if (req.files['video']) {
            // Delete old video if exists
            if (project.video) {
                const oldVideoPath = path.join(__dirname, '..', project.video);
                if (fs.existsSync(oldVideoPath)) fs.unlinkSync(oldVideoPath);
            }
            project.video = '/uploads/' + req.files['video'][0].filename;
        }
        
        if (req.files['images']) {
            const newImages = req.files['images'].map(file => '/uploads/' + file.filename);
            project.images = [...project.images, ...newImages];
        }
        
        await project.save();
        
        res.json({ message: 'Project updated successfully', project });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete project (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        // Delete associated files
        if (project.video) {
            const videoPath = path.join(__dirname, '..', project.video);
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        }
        
        project.images.forEach(imagePath => {
            const imgPath = path.join(__dirname, '..', imagePath);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        });
        
        await Project.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
