// API Base URL
const API_URL = 'http://localhost:3000/api';
let authToken = null;
let currentUsername = null;

// Check if already logged in
document.addEventListener('DOMContentLoaded', () => {
    authToken = localStorage.getItem('authToken');
    currentUsername = localStorage.getItem('username');
    
    if (authToken) {
        showDashboard();
    }
});

// Login Form
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const credentials = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUsername = data.admin.username;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('username', currentUsername);
            showDashboard();
        } else {
            showMessage('loginMessage', data.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('loginMessage', 'Login failed. Please check if the server is running.', 'error');
    }
});

// Show Dashboard
function showDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    document.getElementById('adminUsername').textContent = currentUsername || 'Admin';
    
    // Setup hamburger menu
    const hamburger = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    if (hamburger) {
        hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            hamburger.classList.toggle('active');
            sidebar.classList.toggle('active');
        });
    }
    
    loadAllContent();
    setupNavigation();
    setupForms();
}

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    authToken = null;
    currentUsername = null;
    location.reload();
});

// Navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const hamburger = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding section
            document.querySelectorAll('.content-section').forEach(sec => {
                sec.classList.remove('active');
            });
            document.getElementById(`${section}Section`).classList.add('active');
            
            // Update title
            document.getElementById('sectionTitle').textContent = item.textContent.trim();
            
            // Close mobile menu
            if (hamburger) {
                hamburger.classList.remove('active');
                sidebar.classList.remove('active');
            }
            
            // Load section data
            if (section === 'messages') {
                loadMessages();
            } else if (section === 'projects') {
                loadProjects();
            }
        });
    });
}

// Setup Forms
function setupForms() {
    // Introduction Form
    document.getElementById('introForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            content: formData.get('content')
        };
        await saveContent('intro', data);
    });
    
    // About Form
    document.getElementById('aboutForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // Check if there's a photo to upload
        const photoFile = formData.get('photo');
        let photoUrl = null;
        
        if (photoFile && photoFile.size > 0) {
            // Upload photo first
            const uploadFormData = new FormData();
            uploadFormData.append('photo', photoFile);
            
            try {
                const uploadResponse = await fetch(`${API_URL}/content/upload-photo`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: uploadFormData
                });
                
                const uploadData = await uploadResponse.json();
                if (uploadResponse.ok) {
                    photoUrl = uploadData.photoUrl;
                }
            } catch (error) {
                console.error('Error uploading photo:', error);
            }
        }
        
        const data = {
            title: formData.get('title'),
            content: formData.get('content')
        };
        
        if (photoUrl) {
            data.photoUrl = photoUrl;
        }
        
        await saveContent('about', data);
    });
    
    // Skills Form
    document.getElementById('skillsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const skills = [];
        document.querySelectorAll('#skillsContainer .field-group').forEach(field => {
            skills.push({
                name: field.querySelector('[name="skillName"]').value,
                description: field.querySelector('[name="skillDescription"]').value,
                icon: field.querySelector('[name="skillIcon"]').value
            });
        });
        await saveContent('skills', { skills });
    });
    
    // Education Form
    document.getElementById('educationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const education = [];
        document.querySelectorAll('#educationContainer .field-group').forEach(field => {
            education.push({
                degree: field.querySelector('[name="degree"]').value,
                institution: field.querySelector('[name="institution"]').value,
                year: field.querySelector('[name="year"]').value,
                description: field.querySelector('[name="eduDescription"]').value
            });
        });
        await saveContent('education', { education });
    });
    
    // Social Links Form
    document.getElementById('socialForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const links = [];
        document.querySelectorAll('#socialContainer .field-group').forEach(field => {
            links.push({
                name: field.querySelector('[name="socialName"]').value,
                url: field.querySelector('[name="socialUrl"]').value,
                icon: field.querySelector('[name="socialIcon"]').value
            });
        });
        await saveContent('social', { links });
    });
    
    // Project Form
    document.getElementById('projectForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProject(e.target);
    });
    
    // Reply Form
    document.getElementById('replyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await sendReply(e.target);
    });
    
    // Password Change Form
    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await changePassword(e.target);
    });
}

// Load All Content
async function loadAllContent() {
    await loadIntro();
    await loadAbout();
    await loadSkills();
    await loadEducation();
    await loadSocial();
    await loadProjects();
    await loadMessages();
}

// Load Introduction
async function loadIntro() {
    try {
        const response = await fetch(`${API_URL}/content/intro`);
        const data = await response.json();
        if (data.data) {
            document.querySelector('#introForm [name="name"]').value = data.data.name || '';
            document.querySelector('#introForm [name="content"]').value = data.data.content || '';
        }
    } catch (error) {
        console.error('Error loading intro:', error);
 

// Load About
async function loadAbout() {
    try {
        const response = await fetch(`${API_URL}/content/about`);
        const data = await response.json();
        if (data.data) {
            document.querySelector('#aboutForm [name="title"]').value = data.data.title || '';
            document.querySelector('#aboutForm [name="content"]').value = data.data.content || '';
            
            // Show current photo if exists
            if (data.data.photoUrl) {
                const preview = document.getElementById('currentPhotoPreview');
                preview.innerHTML = `
                    <div style="text-align: left;">
                        <p><strong>Current Photo:</strong></p>
                        <img src="${data.data.photoUrl}" alt="Profile" style="max-width: 200px; border-radius: 10px; border: 2px solid #e0e0e0;">
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading about:', error);
    }
}   }
}

// Load Skills
async function loadSkills() {
    try {
        const response = await fetch(`${API_URL}/content/skills`);
        const data = await response.json();
        const container = document.getElementById('skillsContainer');
        container.innerHTML = '';
        
        if (data.data && data.data.skills) {
            data.data.skills.forEach(skill => {
                addSkillField(skill);
            });
        } else {
            addSkillField();
        }
    } catch (error) {
        console.error('Error loading skills:', error);
        addSkillField();
    }
}

// Add Skill Field
function addSkillField(skill = {}) {
    const container = document.getElementById('skillsContainer');
    const div = document.createElement('div');
    div.className = 'field-group';
    div.innerHTML = `
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
        <div class="form-group">
            <label>Skill Name</label>
            <input type="text" name="skillName" value="${skill.name || ''}" required>
        </div>
        <div class="form-group">
            <label>Description</label>
            <input type="text" name="skillDescription" value="${skill.description || ''}">
        </div>
        <div class="form-group">
            <label>Icon Class (Font Awesome)</label>
            <input type="text" name="skillIcon" value="${skill.icon || 'fas fa-star'}" placeholder="fas fa-code">
            <small>Visit <a href="https://fontawesome.com/icons" target="_blank">FontAwesome</a> for icons</small>
        </div>
    `;
    container.appendChild(div);
}

// Load Education
async function loadEducation() {
    try {
        const response = await fetch(`${API_URL}/content/education`);
        const data = await response.json();
        const container = document.getElementById('educationContainer');
        container.innerHTML = '';
        
        if (data.data && data.data.education) {
            data.data.education.forEach(edu => {
                addEducationField(edu);
            });
        } else {
            addEducationField();
        }
    } catch (error) {
        console.error('Error loading education:', error);
        addEducationField();
    }
}

// Add Education Field
function addEducationField(edu = {}) {
    const container = document.getElementById('educationContainer');
    const div = document.createElement('div');
    div.className = 'field-group';
    div.innerHTML = `
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
        <div class="form-group">
            <label>Degree</label>
            <input type="text" name="degree" value="${edu.degree || ''}" required>
        </div>
        <div class="form-group">
            <label>Institution</label>
            <input type="text" name="institution" value="${edu.institution || ''}" required>
        </div>
        <div class="form-group">
            <label>Year</label>
            <input type="text" name="year" value="${edu.year || ''}" placeholder="2020 - 2024">
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea name="eduDescription" rows="3">${edu.description || ''}</textarea>
        </div>
    `;
    container.appendChild(div);
}

// Load Social Links
async function loadSocial() {
    try {
        const response = await fetch(`${API_URL}/content/social`);
        const data = await response.json();
        const container = document.getElementById('socialContainer');
        container.innerHTML = '';
        
        if (data.data && data.data.links) {
            data.data.links.forEach(link => {
                addSocialField(link);
            });
        } else {
            addSocialField();
        }
    } catch (error) {
        console.error('Error loading social:', error);
        addSocialField();
    }
}

// Add Social Field
function addSocialField(link = {}) {
    const container = document.getElementById('socialContainer');
    const div = document.createElement('div');
    div.className = 'field-group';
    div.innerHTML = `
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
        <div class="form-group">
            <label>Platform Name</label>
            <input type="text" name="socialName" value="${link.name || ''}" placeholder="LinkedIn" required>
        </div>
        <div class="form-group">
            <label>URL</label>
            <input type="text" name="socialUrl" value="${link.url || ''}" placeholder="https://linkedin.com/in/yourname" required>
        </div>
        <div class="form-group">
            <label>Icon Class (Font Awesome)</label>
            <input type="text" name="socialIcon" value="${link.icon || 'fab fa-linkedin'}" placeholder="fab fa-linkedin">
        </div>
    `;
    container.appendChild(div);
}

// Load Projects
async function loadProjects() {
    try {
        const response = await fetch(`${API_URL}/projects`);
        const projects = await response.json();
        const container = document.getElementById('projectsList');
        
        if (projects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>No projects yet. Click "Add Project" to create one.</p>
                </div>
            `;
        } else {
            container.innerHTML = projects.map(project => `
                <div class="project-item">
                    <img src="${project.images[0] || 'https://via.placeholder.com/150x100'}" 
                         alt="${project.title}" class="project-thumbnail">
                    <div class="project-details">
                        <h4>${project.title}</h4>
                        <p>${project.description.substring(0, 150)}...</p>
                        <div class="project-actions">
                            <button class="btn-secondary" onclick="editProject('${project._id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn-danger" onclick="deleteProject('${project._id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Show Add Project Modal
function showAddProject() {
    document.getElementById('projectModalTitle').textContent = 'Add New Project';
    document.getElementById('projectForm').reset();
    document.getElementById('projectModal').style.display = 'block';
}

// Close Project Modal
function closeProjectModal() {
    document.getElementById('projectModal').style.display = 'none';
}

// Save Project
async function saveProject(form) {
    const formData = new FormData(form);
    const projectId = formData.get('projectId');
    
    // Process technologies
    const techString = formData.get('technologies');
    const technologies = techString ? techString.split(',').map(t => t.trim()) : [];
    formData.delete('technologies');
    formData.append('technologies', JSON.stringify(technologies));
    
    try {
        const url = projectId ? `${API_URL}/projects/${projectId}` : `${API_URL}/projects`;
        const method = projectId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Project saved successfully!');
            closeProjectModal();
            loadProjects();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error saving project:', error);
        alert('Failed to save project');
    }
}

// Edit Project
async function editProject(projectId) {
    try {
        const response = await fetch(`${API_URL}/projects/${projectId}`);
        const project = await response.json();
        
        document.getElementById('projectModalTitle').textContent = 'Edit Project';
        const form = document.getElementById('projectForm');
        form.querySelector('[name="projectId"]').value = project._id;
        form.querySelector('[name="title"]').value = project.title;
        form.querySelector('[name="description"]').value = project.description;
        form.querySelector('[name="technologies"]').value = project.technologies.join(', ');
        form.querySelector('[name="featured"]').checked = project.featured;
        
        document.getElementById('projectModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading project:', error);
        alert('Failed to load project');
    }
}

// Delete Project
async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
        const response = await fetch(`${API_URL}/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Project deleted successfully!');
            loadProjects();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project');
    }
}

// Load Messages
async function loadMessages() {
    try {
        const response = await fetch(`${API_URL}/messages`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const messages = await response.json();
        const container = document.getElementById('messagesList');
        
        // Update unread count
        const unreadCount = messages.filter(m => !m.read).length;
        const badge = document.getElementById('unreadCount');
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
        
        if (messages.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-envelope-open"></i>
                    <p>No messages yet.</p>
                </div>
            `;
        } else {
            container.innerHTML = messages.map(message => `
                <div class="message-item ${!message.read ? 'unread' : ''}">
                    <div class="message-header">
                        <span class="message-from">${message.name} (${message.email})</span>
                        <span class="message-date">${new Date(message.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="message-subject"><strong>Subject:</strong> ${message.subject}</div>
                    <div class="message-content">${message.message}</div>
                    <div class="message-actions">
                        ${!message.read ? `
                            <button class="btn-secondary" onclick="markAsRead('${message._id}')">
                                <i class="fas fa-check"></i> Mark as Read
                            </button>
                        ` : ''}
                        ${!message.replied ? `
                            <button class="btn-primary" onclick="showReply('${message._id}', '${message.email}', '${message.name}')">
                                <i class="fas fa-reply"></i> Reply
                            </button>
                        ` : '<span style="color: green;"><i class="fas fa-check-circle"></i> Replied</span>'}
                        <button class="btn-danger" onclick="deleteMessage('${message._id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Mark Message as Read
async function markAsRead(messageId) {
    try {
        const response = await fetch(`${API_URL}/messages/${messageId}/read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            loadMessages();
        }
    } catch (error) {
        console.error('Error marking as read:', error);
    }
}

// Show Reply Modal
function showReply(messageId, email, name) {
    document.getElementById('replyModalContent').innerHTML = `
        <p><strong>To:</strong> ${name} (${email})</p>
    `;
    document.querySelector('#replyForm [name="messageId"]').value = messageId;
    document.querySelector('#replyForm [name="replyMessage"]').value = '';
    document.getElementById('replyModal').style.display = 'block';
}

// Close Reply Modal
function closeReplyModal() {
    document.getElementById('replyModal').style.display = 'none';
}

// Send Reply
async function sendReply(form) {
    const formData = new FormData(form);
    const messageId = formData.get('messageId');
    const replyMessage = formData.get('replyMessage');
    
    try {
        const response = await fetch(`${API_URL}/messages/${messageId}/reply`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ replyMessage })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Reply sent successfully!');
            closeReplyModal();
            loadMessages();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error sending reply:', error);
        alert('Failed to send reply');
    }
}

// Delete Message
async function deleteMessage(messageId) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
        const response = await fetch(`${API_URL}/messages/${messageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            alert('Message deleted successfully!');
            loadMessages();
        }
    } catch (error) {
        console.error('Error deleting message:', error);
        alert('Failed to delete message');
    }
}

// Change Password
async function changePassword(form) {
    const formData = new FormData(form);
    const oldPassword = formData.get('oldPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: currentUsername,
                oldPassword,
                newPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Password changed successfully!');
            form.reset();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error changing password:', error);
        alert('Failed to change password');
    }
}

// Save Content Helper
async function saveContent(section, data) {
    try {
        const response = await fetch(`${API_URL}/content/${section}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Content saved successfully!');
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error saving content:', error);
        alert('Failed to save content');
    }
}

// Show Message Helper
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}
