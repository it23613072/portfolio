const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
let mongoServer;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve all static files from root directory
app.use('/uploads', express.static('uploads'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Load models
const Project = require('./models/Project');

// MongoDB Connection - Using In-Memory Server
async function connectDB() {
    try {
        // Start in-memory MongoDB server
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB Memory Server Connected');
        console.log('📝 Note: Data is stored in memory (will reset on restart)');
        
        // Seed sample projects
        const existingProjects = await Project.countDocuments();
        if (existingProjects === 0) {
            const sampleProjects = [
                {
                    title: 'E-Commerce Platform',
                    description: 'A full-featured e-commerce platform with product catalog, shopping cart, secure payment integration, and admin dashboard for inventory management.',
                    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
                    featured: true,
                    order: 1
                },
                {
                    title: 'Task Management App',
                    description: 'A collaborative task management application with real-time updates, team collaboration features, and progress tracking. Includes drag-and-drop interface for intuitive task organization.',
                    technologies: ['Vue.js', 'Firebase', 'Tailwind CSS'],
                    featured: true,
                    order: 2
                },
                {
                    title: 'Mobile Weather App',
                    description: 'A beautiful and responsive weather application with real-time weather data, weather forecasts, location tracking, and weather alerts.',
                    technologies: ['React Native', 'OpenWeather API', 'Redux'],
                    featured: true,
                    order: 3
                },
                {
                    title: 'Dashboard Analytics',
                    description: 'An interactive analytics dashboard for data visualization and reporting. Features real-time data updates, customizable charts, and export functionality.',
                    technologies: ['React', 'D3.js', 'Express', 'PostgreSQL'],
                    featured: false,
                    order: 4
                }
            ];
            
            await Project.insertMany(sampleProjects);
            console.log('✅ Sample projects seeded successfully');
        }
        
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    }
}

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/content', require('./routes/content'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/messages', require('./routes/messages'));

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'admin.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`👤 Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(`🔐 Default Login: admin / admin123`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    if (mongoServer) {
        await mongoServer.stop();
    }
    console.log('👋 Server shut down gracefully');
    process.exit(0);
});
