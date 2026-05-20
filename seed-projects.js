const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Project = require('./models/Project');
require('dotenv').config();

let mongoServer;

async function seedProjects() {
    try {
        // Connect to the in-memory MongoDB server
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        
        // Sample projects data
        const projects = [
            {
                title: 'E-Commerce Platform',
                description: 'A full-featured e-commerce platform with product catalog, shopping cart, secure payment integration, and admin dashboard for inventory management.',
                technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
                featured: true,
                order: 1,
                images: [],
                videoUrl: 'https://example.com/video1.mp4'
            },
            {
                title: 'Task Management App',
                description: 'A collaborative task management application with real-time updates, team collaboration features, and progress tracking. Includes drag-and-drop interface for intuitive task organization.',
                technologies: ['Vue.js', 'Firebase', 'Tailwind CSS'],
                featured: true,
                order: 2,
                images: [],
                videoUrl: 'https://example.com/video2.mp4'
            },
            {
                title: 'Mobile Weather App',
                description: 'A beautiful and responsive weather application with real-time weather data, weather forecasts, location tracking, and weather alerts.',
                technologies: ['React Native', 'OpenWeather API', 'Redux'],
                featured: true,
                order: 3,
                images: [],
                videoUrl: 'https://example.com/video3.mp4'
            },
            {
                title: 'Dashboard Analytics',
                description: 'An interactive analytics dashboard for data visualization and reporting. Features real-time data updates, customizable charts, and export functionality.',
                technologies: ['React', 'D3.js', 'Express', 'PostgreSQL'],
                featured: false,
                order: 4,
                images: [],
                videoUrl: ''
            },
            {
                title: 'Social Media Platform',
                description: 'A social networking platform with user profiles, messaging, feed, and real-time notifications. Includes photo sharing and community features.',
                technologies: ['Next.js', 'Node.js', 'MongoDB', 'Socket.io'],
                featured: true,
                order: 5,
                images: [],
                videoUrl: 'https://example.com/video4.mp4'
            }
        ];
        
        // Insert projects
        const result = await Project.insertMany(projects);
        console.log(`✅ Created ${result.length} projects`);
        
        // Verify by fetching all projects
        const allProjects = await Project.find();
        console.log(`✅ Total projects in database: ${allProjects.length}`);
        
        // Close connection
        await mongoose.connection.close();
        if (mongoServer) {
            await mongoServer.stop();
        }
        
        console.log('✅ Seed completed successfully');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
}

seedProjects();
