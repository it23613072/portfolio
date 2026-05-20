const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    video: {
        type: String,  // Video file path
        default: null
    },
    images: [{
        type: String  // Array of image paths
    }],
    technologies: [{
        type: String
    }],
    featured: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    order: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Project', projectSchema);
