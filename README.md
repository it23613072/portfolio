# Portfolio Website with Admin Dashboard

A full-stack portfolio website with a complete admin dashboard for managing content, projects, and messages.

## Features

### Portfolio Website
- ✨ Creative homepage with "PORTFOLIO" typography design
- 📝 Dynamic Introduction/About section
- 💼 Skills showcase
- 🎓 Education timeline
- 🚀 Projects gallery with video and images
- 📧 Contact form with Gmail integration
- 🔗 Social media links
- 📱 Fully responsive design

### Admin Dashboard
- 🔐 Secure login system with JWT authentication
- ✏️ Edit all content sections (intro, skills, education, social)
- 📁 Upload projects with videos and multiple images
- 📨 View and reply to contact messages
- ✉️ Email replies directly from dashboard
- 🔒 Password management
- 🎨 Beautiful, user-friendly interface

## Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Font Awesome icons
- Google Fonts (Playfair Display, Cormorant Garamond)

**Backend:**
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT for authentication
- Multer for file uploads
- Nodemailer for email (Gmail SMTP)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud - MongoDB Atlas)
- Gmail account for email functionality

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

2. Edit `.env` file with your settings:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/portfolio
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio

# JWT Secret (Change this!)
JWT_SECRET=your_random_secret_key_here

# Gmail Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Admin Credentials (will be used on first login)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Server Port
PORT=3000

# Session Secret
SESSION_SECRET=another_random_secret
```

### Step 3: Setup Gmail App Password

To send emails, you need a Gmail App Password:

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security → App Passwords
4. Generate a new app password for "Mail"
5. Copy the password to `.env` as `EMAIL_PASS`

### Step 4: Start MongoDB

**Option A: Local MongoDB**
```bash
# Make sure MongoDB is installed and running
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Create a free cluster at https://www.mongodb.com/cloud/atlas
- Get your connection string
- Replace `MONGODB_URI` in `.env`

### Step 5: Run the Application

```bash
# Start the server
npm start

# Or use nodemon for development
npm run dev
```

The server will start at `http://localhost:3000`

## Usage

### Access the Portfolio
Open your browser and go to:
```
http://localhost:3000
```

### Access the Admin Dashboard
Go to:
```
http://localhost:3000/admin
```

**Default Login Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT:** Change the password immediately after first login!

## Admin Dashboard Guide

### 1. Introduction Section
- Add your name and introduction text
- This appears on the "About Me" section of your portfolio

### 2. Skills Section
- Click "Add Skill" to add new skills
- Enter skill name, description, and Font Awesome icon class
- Visit https://fontawesome.com/icons for icon codes

### 3. Education Section
- Click "Add Education" to add degrees/certifications
- Fill in degree, institution, year, and description

### 4. Projects Section
- Click "Add Project" to create a new project
- Upload a video (demonstration)
- Upload multiple images (screenshots, mockups)
- Add technologies used (comma-separated)
- Mark as "Featured" to highlight important projects
- **Project Display:** When visitors click on a project, the video auto-plays with images below

### 5. Social Links
- Add links to your social media profiles
- Supports LinkedIn, GitHub, Twitter, Instagram, etc.
- Use Font Awesome brand icons

### 6. Messages
- View all contact form submissions
- Mark messages as read
- Reply directly (email sent via Gmail)
- Delete unwanted messages

### 7. Settings
- Change your admin password
- Keep your account secure

## Project Structure

```
portfolio/
├── index.html              # Main portfolio page
├── style.css              # Portfolio styles
├── script.js              # Portfolio JavaScript
├── P.png                  # Girl image for homepage
├── server.js              # Express server
├── package.json           # Dependencies
├── .env                   # Environment variables (create this!)
├── admin/
│   ├── admin.html         # Admin dashboard
│   ├── admin.css          # Admin styles
│   └── admin.js           # Admin JavaScript
├── models/
│   ├── Admin.js           # Admin user model
│   ├── Content.js         # Content sections model
│   ├── Project.js         # Projects model
│   └── Message.js         # Messages model
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── content.js         # Content management routes
│   ├── projects.js        # Projects routes
│   └── messages.js        # Messages routes
├── middleware/
│   └── auth.js            # JWT authentication middleware
└── uploads/               # Uploaded files (auto-created)
```

## Features Explained

### Homepage Design
The homepage features large "PORTFOLIO" text with the girl's photo inside the "O" letter - exactly as shown in P.png. The design uses creative typography with a cream background (#efebe2).

### Scroll Navigation
- Start at the creative homepage
- Scroll down through sections: Intro → Skills → Education → Projects → Contact
- Smooth scrolling animations

### Project Pages
When a visitor clicks on any project:
1. A modal opens
2. Video starts playing automatically (muted by default)
3. Project images display below the video
4. Technologies and description shown
5. All managed from admin dashboard

### Contact Form
- Visitors fill out the contact form
- Messages sent to your Gmail
- Messages appear in admin dashboard
- Reply directly from dashboard (email sent to visitor)

### Security
- JWT authentication for admin access
- Password hashing with bcrypt
- Session management
- Protected API routes

## API Endpoints

### Public Endpoints
```
GET  /                          # Portfolio homepage
GET  /api/content/:section      # Get content (intro, skills, education, social)
GET  /api/projects              # Get all projects
GET  /api/projects/:id          # Get single project
POST /api/messages/send         # Send contact message
```

### Protected Endpoints (Admin Only)
```
POST   /api/auth/login               # Admin login
POST   /api/auth/logout              # Admin logout
POST   /api/auth/change-password     # Change password
PUT    /api/content/:section         # Update content
POST   /api/projects                 # Create project
PUT    /api/projects/:id             # Update project
DELETE /api/projects/:id             # Delete project
GET    /api/messages                 # Get all messages
PUT    /api/messages/:id/read        # Mark as read
POST   /api/messages/:id/reply       # Reply to message
DELETE /api/messages/:id             # Delete message
```

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running (local or Atlas)
- Check your `MONGODB_URI` in `.env`

### Email Not Sending
- Verify Gmail credentials in `.env`
- Make sure you're using App Password, not regular password
- Check if 2FA is enabled in Google Account

### File Upload Issues
- Make sure `uploads/` folder exists
- Check file size limits (default: 100MB)
- Verify file types (images: jpg, png, gif / video: mp4, mov, avi)

### Can't Login to Admin
- Default credentials: admin / admin123
- If changed and forgotten, you'll need to reset the database

## Deployment

### Deploy to Heroku

1. Install Heroku CLI
2. Create Heroku app:
```bash
heroku create your-portfolio-name
```

3. Add MongoDB Atlas (free tier):
```bash
heroku addons:create mongolab:sandbox
```

4. Set environment variables:
```bash
heroku config:set JWT_SECRET=your_secret
heroku config:set EMAIL_USER=your_email@gmail.com
heroku config:set EMAIL_PASS=your_app_password
heroku config:set ADMIN_USERNAME=admin
heroku config:set ADMIN_PASSWORD=admin123
```

5. Deploy:
```bash
git push heroku main
```

### Deploy to Other Platforms
- **Vercel**: Backend needs serverless functions
- **Railway**: Easy deployment with MongoDB
- **Render**: Similar to Heroku, free tier available

## Security Recommendations

1. ✅ Change default admin credentials immediately
2. ✅ Use strong JWT_SECRET and SESSION_SECRET
3. ✅ Enable HTTPS in production
4. ✅ Set secure cookie flags for production
5. ✅ Regularly update dependencies
6. ✅ Never commit `.env` file to git

## Customization

### Colors
Edit CSS variables in `style.css`:
```css
:root {
    --bg-cream: #efebe2;
    --text-dark: #2c2c2c;
    --accent-color: #8b7355;
    --light-accent: #c9b8a3;
}
```

### Fonts
Change fonts in HTML `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Your+Font&display=swap" rel="stylesheet">
```

### Homepage Image
Replace `P.png` with your own image (keep same filename or update `index.html`)

## Support

For issues or questions:
1. Check this README thoroughly
2. Verify all environment variables are set
3. Check console for error messages
4. Make sure all dependencies are installed

## License

This project is open source and available for personal and commercial use.

---

**Built with ❤️ for creative portfolios**
