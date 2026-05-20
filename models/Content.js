const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    section: {
        type: String,
        required: true,
        enum: ['intro', 'skills', 'education', 'social', 'about']
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Content', contentSchema);
