const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth');

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send message (Public - Contact form)
router.post('/send', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Save to database
        const newMessage = new Message({
            name,
            email,
            subject: subject || 'Contact Form Message',
            message
        });
        await newMessage.save();
        
        // Send email notification to admin
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `New Portfolio Message: ${subject || 'No Subject'}`,
            html: `
                <h3>New Message from Portfolio Contact Form</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        
        res.json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

// Get all messages (Admin only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark message as read (Admin only)
router.put('/:id/read', authMiddleware, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        
        message.read = true;
        await message.save();
        
        res.json({ message: 'Message marked as read' });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reply to message (Admin only)
router.post('/:id/reply', authMiddleware, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        
        const { replyMessage } = req.body;
        
        // Send reply email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: message.email,
            subject: `Re: ${message.subject}`,
            html: `
                <p>Hi ${message.name},</p>
                <p>${replyMessage}</p>
                <br>
                <hr>
                <p><small><strong>Original message:</strong></small></p>
                <p><small>${message.message}</small></p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        
        message.replied = true;
        await message.save();
        
        res.json({ message: 'Reply sent successfully' });
    } catch (error) {
        console.error('Reply error:', error);
        res.status(500).json({ message: 'Failed to send reply' });
    }
});

// Delete message (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
