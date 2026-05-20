// Frontend-only: load data from local JSON files in `/data`
// Global cache for loaded projects
let _projects = [];

// Generate SVG placeholder
function generateProjectPlaceholder() {
    const colors = ['#8b7355', '#c9b8a3', '#efebe2', '#d4c5b9'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const svg = `
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${randomColor};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#efebe2;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="300" height="200" fill="url(#grad)"/>
            <text x="50%" y="50%" font-family="Playfair Display, serif" font-size="40" font-weight="bold" 
                  fill="#2c2c2c" text-anchor="middle" dominant-baseline="middle" opacity="0.3">
                Project
            </text>
            <circle cx="150" cy="100" r="30" fill="none" stroke="#2c2c2c" stroke-width="2" opacity="0.2"/>
        </svg>
    `;
    
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

// Load content when page loads
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    loadAllContent();
    setupContactForm();
    setupModal();
    updateYear();
    setupScrollAnimations();
    setupScrollIndicator();
});

// Setup Navigation
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Update copyright year
function updateYear() {
    const el = document.getElementById('currentYear');
    if (el) el.textContent = new Date().getFullYear();
}

// Load all content from local JSON
async function loadAllContent() {
    try {
        const res = await fetch('data/content.json?_=' + Date.now());
        const content = await res.json();
        if (content.intro) displayIntro(content.intro);
        if (content.about) displayAbout(content.about);
        if (content.skills) displaySkills(content.skills);
        if (content.education) displayEducation(content.education);
        if (content.social) displaySocial(content.social);

        // Load projects from local JSON
        const p = await fetch('data/projects.json?_=' + Date.now());
        const projectsData = await p.json();
        _projects = Array.isArray(projectsData) ? projectsData : (projectsData.projects || []);
        displayProjects(_projects);

    } catch (error) {
        console.error('Error loading content:', error);
        displayFallbackContent();
    }
}

// Display intro content — show name/headline only
function displayIntro(data) {
    const introContent = document.getElementById('introContent');
    if (!introContent) return;

    const name = data && (data.name || data.title) ? (data.name || data.title) : 'Welcome';
    const headline = data && data.headline ? data.headline : '';

    introContent.innerHTML = `
        <h1 style="font-size: 42px; margin-bottom: 8px; font-family: 'Playfair Display', serif;">
            ${name}
        </h1>
        ${headline ? `<p class="hero-subtitle" style="font-size:18px; color:#555; margin-bottom:14px;">${headline}</p>` : ''}
    `;
}

// Display About section with profile image and bio only
function displayAbout(data) {
    // Display profile image
    const profileImg = document.getElementById('profileImage');
    if (profileImg && data && data.photoUrl) {
        profileImg.src = data.photoUrl;
        profileImg.style.display = 'block';
    }

    // Display about text
    const introContent = document.getElementById('introContent');
    if (introContent && data && data.content) {
        const aboutDiv = document.createElement('div');
        aboutDiv.style.marginTop = '16px';
        aboutDiv.innerHTML = `<p style="font-size: 16px; line-height: 1.8;">${data.content}</p>`;
        introContent.appendChild(aboutDiv);
    }
}

// Display skills
function displaySkills(data) {
    const skillsContent = document.getElementById('skillsContent');
    if (!skillsContent) return;

    if (data && data.skills && data.skills.length > 0) {
        skillsContent.innerHTML = data.skills.map(skill => `
            <div class="skill-card">
                <i class="${skill.icon || 'fas fa-star'}"></i>
                <h3>${skill.name}</h3>
                <p>${skill.description || ''}</p>
            </div>
        `).join('');
    } else {
        skillsContent.innerHTML = `
            <div class="skill-card">
                <i class="fas fa-code"></i>
                <h3>Web Development</h3>
                <p>Add skills from admin dashboard</p>
            </div>
        `;
    }
}

// Display education
function displayEducation(data) {
    const educationContent = document.getElementById('educationContent');
    if (!educationContent) return;

    if (data && data.education && data.education.length > 0) {
        educationContent.innerHTML = data.education.map(edu => `
            <div class="education-item">
                <h3>${edu.degree || 'Degree'}</h3>
                <div class="year">${edu.year || ''}</div>
                <p><strong>${edu.institution || ''}</strong></p>
                <p>${edu.description || ''}</p>
            </div>
        `).join('');
    } else {
        educationContent.innerHTML = `
            <div class="education-item">
                <h3>Your Education</h3>
                <div class="year">Year</div>
                <p><strong>Institution Name</strong></p>
                <p>Add education details from admin dashboard</p>
            </div>
        `;
    }
}

// Display projects (preview - show only 3)
function displayProjects(projects) {
    const projectsContent = document.getElementById('projectsContent');
    if (!projectsContent) return;

    if (projects && Array.isArray(projects) && projects.length > 0) {
        const previewProjects = projects.slice(0, 3);
        projectsContent.innerHTML = previewProjects.map(project => {
            const thumbnail = (project.images && project.images.length > 0)
                ? project.images[0]
                : (project.link ? getGithubThumbnail(project.link) : generateProjectPlaceholder());
            const techs = Array.isArray(project.technologies) ? project.technologies : (String(project.technologies||'').split(',').map(t=>t.trim()).filter(Boolean));

            return `
                <div class="project-card" style="cursor: pointer; position: relative;" onclick="window.location.href='projects.html'">
                    <img src="${thumbnail}" alt="${project.title}" 
                         onerror="this.src='${generateProjectPlaceholder()}'; this.style.backgroundColor='#f5f1e8';"
                         style="width: 100%; height: 200px; object-fit: cover; background-color: #f5f1e8;">
                    ${project.link ? `<a href="${project.link}" class="project-github-link" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();"><i class="fab fa-github"></i></a>` : ''}
                    <div class="project-info">
                        <h3>${project.title}</h3>
                        <p>${project.description ? (project.description.length>100 ? project.description.substring(0,100)+ '...' : project.description) : 'Click to view more'}</p>
                        ${techs && techs.length>0 ? `<div class="project-tech">${techs.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}</div>` : ''}
                        <p style="color: var(--accent-color); font-weight: 600; margin-top: 10px;">→ View Details</p>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        projectsContent.innerHTML = `
            <div class="project-card" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; cursor: pointer;" onclick="window.location.href='projects.html'">
                <i class="fas fa-folder-open" style="font-size: 3rem; color: var(--accent-color); margin-bottom: 20px;"></i>
                <h3>Check Out My Projects</h3>
                <p style="color: #999; margin: 10px 0;">Click here to view all projects with videos</p>
            </div>
        `;
    }
}

// Display social links
function displaySocial(data) {
    const socialLinks = document.getElementById('socialLinks');
    if (!socialLinks) return;

    if (data && data.links && data.links.length > 0) {
        socialLinks.innerHTML = data.links.map(link => `
            <a href="${link.url}" target="_blank" class="social-link">
                <i class="${link.icon}"></i>
                <span>${link.name}</span>
            </a>
        `).join('');
    } else {
        socialLinks.innerHTML = `
            <a href="#" class="social-link">
                <i class="fab fa-linkedin"></i>
                <span>LinkedIn</span>
            </a>
            <a href="#" class="social-link">
                <i class="fab fa-github"></i>
                <span>GitHub</span>
            </a>
            <a href="#" class="social-link">
                <i class="fab fa-twitter"></i>
                <span>Twitter</span>
            </a>
            <p style="margin-top: 20px; color: #666;">Add social links from admin dashboard</p>
        `;
    }
}

// Display fallback content when API isn't available
function displayFallbackContent() {
    const el = document.getElementById('introContent');
    if (!el) return;
    el.innerHTML = `
        <h1 style="font-size: 42px; margin-bottom: 20px;">Welcome</h1>
        <p style="font-size: 20px;">Please start the server to load dynamic content. Run: <code>npm install && npm start</code></p>
    `;
}

// Open project modal
async function openProject(projectId) {
    try {
        const project = _projects.find(p => String(p._id || p.id) === String(projectId) || p.id === projectId);
        if (!project) throw new Error('Project not found');
        
        const modalContent = document.getElementById('modalContent');
        modalContent.innerHTML = `
            <h2 class="modal-title">${project.title}</h2>
            ${project.video ? `
                <video class="modal-video" controls autoplay muted>
                    <source src="${project.video}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            ` : ''}
            <div class="modal-description">
                <p>${project.description}</p>
            </div>
            ${(()=>{
                const techs = Array.isArray(project.technologies) ? project.technologies : (String(project.technologies||'').split(',').map(t=>t.trim()).filter(Boolean));
                return techs && techs.length>0 ? `
                    <div class="project-tech" style="margin-bottom: 20px;">
                        ${techs.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                ` : '';
            })()}
            ${project.images && project.images.length > 0 ? `
                <div class="modal-images">
                    ${project.images.map(img => `<img src="${img}" alt="${project.title}">`).join('')}
                </div>
            ` : ''}
            ${project.link ? `<div style="margin-top:12px;"><a href="${project.link}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">View Repository</a></div>` : ''}
        `;
        
        const modal = document.getElementById('projectModal');
        if (modal) modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error loading project:', error);
        alert('Error loading project details');
    }
}

// Return a GitHub Open Graph image URL for a repo link
function getGithubThumbnail(link) {
    try {
        const url = new URL(link);
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) {
            const owner = parts[0];
            const repo = parts[1].replace(/\.git$/, '');
            return `https://opengraph.githubassets.com/1/${owner}/${repo}`;
        }
    } catch (e) {
        // ignore
    }
    return generateProjectPlaceholder();
}

// Setup modal close functionality
function setupModal() {
    const modal = document.getElementById('projectModal');
    const closeBtn = document.querySelector('.close-modal');
    if (!modal || !closeBtn) return;
    
    closeBtn.onclick = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        const video = modal.querySelector('video');
        if (video) video.pause();
    };
    
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            const video = modal.querySelector('video');
            if (video) video.pause();
        }
    };
}

// Setup contact form
function setupContactForm() {
    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            name: form.name.value,
            email: form.email.value,
            subject: form.subject.value,
            message: form.message.value
        };
        try {
            const subject = encodeURIComponent(formData.subject || `Contact from ${formData.name || 'Website'}`);
            const body = encodeURIComponent(`Name: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0A%0D%0A${formData.message}`);
            window.location.href = `mailto:kavithmaathukorala@gmail.com?subject=${subject}&body=${body}`;
            if (formMessage) {
                formMessage.className = 'form-message success';
                formMessage.textContent = 'Your email client should open. If not, email: kavithmaathukorala@gmail.com';
            }
            form.reset();
        } catch (error) {
            console.error('Error opening mail client:', error);
            if (formMessage) {
                formMessage.className = 'form-message error';
                formMessage.textContent = 'Failed to open mail client. Please email directly to kavithmaathukorala@gmail.com';
            }
        }
        setTimeout(() => {
            if (formMessage) formMessage.style.display = 'none';
        }, 5000);
    });
}

// Smooth scroll with offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll animation for sections
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Hero section is always visible
const hero = document.querySelector('.hero-section');
if (hero) {
    hero.style.opacity = '1';
    hero.style.transform = 'translateY(0)';
}

// Setup scroll animations for elements
function setupScrollAnimations() {
    const elements = document.querySelectorAll(
        '.skill-card, .education-item, .project-card, .section-title'
    );
    
    const elementObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 50);
                elementObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        elementObserver.observe(el);
    });
}

// Setup scroll indicator animation
function setupScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const opacity = Math.max(0, 1 - scrollTop / 500);
            scrollIndicator.style.opacity = opacity;
            scrollIndicator.style.pointerEvents = opacity > 0 ? 'auto' : 'none';
        });
        
        const mouse = scrollIndicator.querySelector('.mouse');
        if (mouse) {
            setInterval(() => {
                mouse.style.animation = 'scroll-wheel 1.5s ease-in-out infinite';
            }, 100);
        }
    }
}
