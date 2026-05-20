// Frontend-only: load content from local JSON
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Prevent cached content.json during development
        const res = await fetch('data/content.json?_=' + Date.now());
        const content = await res.json();
        console.log('about.js: loaded content.json', content);

        if (content.about) {
            applyAboutContent(content.about);
        } else {
            document.getElementById('aboutContent').innerHTML = '<p>Welcome to my portfolio! Check back soon for more information.</p>';
        }

        // Build a single connect section from About + Social data
        const connectLinks = [];
        if (content.about && content.about.connect) {
            const c = content.about.connect;
            if (c.email) connectLinks.push({ name: 'Gmail', url: `mailto:${c.email}`, icon: 'fas fa-envelope', label: c.email });
            if (c.linkedin) {
                const linkedinLabel = c.linkedin.replace(/^https?:\/\//, '').replace(/\/$/, '');
                connectLinks.push({ name: 'LinkedIn', url: c.linkedin, icon: 'fab fa-linkedin', label: linkedinLabel });
            }
            if (c.github) {
                const githubLabel = c.github.replace(/^https?:\/\//, '').replace(/\/$/, '');
                connectLinks.push({ name: 'GitHub', url: c.github, icon: 'fab fa-github', label: githubLabel });
            }
        }
        if (content.social && content.social.links && content.social.links.length > 0) {
            content.social.links.forEach(link => {
                if (!connectLinks.some(item => item.url === link.url)) {
                    connectLinks.push({ name: link.name, url: link.url, icon: link.icon, label: link.name });
                }
            });
        }

        applySocialLinks({ links: connectLinks });

        if (content.skills) {
            applySkills(content.skills);
        }

        if (content.education) {
            applyEducation(content.education);
        }

        // Projects count
        const p = await fetch('data/projects.json');
        const projectsData = await p.json();
        const projectsArray = Array.isArray(projectsData) ? projectsData : (projectsData.projects || []);
        if (projectsArray && projectsArray.length > 0) {
            const pc = document.getElementById('projectsCount');
            if (pc) pc.textContent = `${projectsArray.length}+ Completed Projects`;
        }

        // Experience (internship) — render summary if present
        if (content.experience) {
            const ex = content.experience;
            const expEl = document.getElementById('experienceText');
            if (expEl) expEl.textContent = `${ex.title}${ex.description ? ' — ' + ex.description : ''}`;
        }

        // Tech summary — show short tech list if available
        if (content.skills && content.skills.skills && content.skills.skills.length > 0) {
            const techEl = document.getElementById('techText');
            if (techEl) {
                const names = content.skills.skills.slice(0,4).map(s => s.name);
                techEl.textContent = names.join(' • ');
            }
        }

    } catch (error) {
        console.error('Error loading about content:', error);
    }

    setupNavigation();
    setupScrollButton();
});

// Load About Content
function applyAboutContent(data) {
    console.log('applyAboutContent', data);
    if (!data) return;
    if (data.title) document.getElementById('aboutTitle').textContent = data.title;
    if (data.content) {
        const contentDiv = document.getElementById('aboutContent');
        const paragraphs = data.content.split('\n').filter(p => p.trim());
        contentDiv.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
    }
    if (data.photoUrl) document.getElementById('profileImage').src = data.photoUrl;
}

// Load Social Links
function applySocialLinks(data) {
    const container = document.getElementById('socialLinks');
    if (data && data.links && data.links.length > 0) {
        container.innerHTML = data.links.map(link => `
            <a href="${link.url}" class="social-link social-link-row" target="_blank" rel="noopener noreferrer" title="${link.name}">
                <span class="social-link-icon"><i class="${link.icon}"></i></span>
                <span class="social-link-content">
                    <span class="social-link-name">${link.name}</span>
                    <span class="social-link-label">${link.label || link.name}</span>
                </span>
            </a>
        `).join('');
    } else {
        container.innerHTML = '<p style="color: #666;">Social links will appear here.</p>';
    }
}

// Load Skills
function applySkills(data) {
    const container = document.getElementById('skillsOverview');
    if (data && data.skills && data.skills.length > 0) {
        container.innerHTML = data.skills.map(skill => `
            <div class="skill-card">
                <div class="skill-icon">
                    <i class="${skill.icon}"></i>
                </div>
                <h3>${skill.name}</h3>
                <p>${skill.description || ''}</p>
            </div>
        `).join('');
    } else {
        container.innerHTML = '<p style="text-align: center; color: #666;">Skills will appear here.</p>';
    }
}

// Load Education
function applyEducation(data) {
    console.log('applyEducation', data);
    const container = document.getElementById('educationTimeline');
    if (data && data.education && data.education.length > 0) {
        container.innerHTML = data.education.map(edu => `
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="timeline-year">${edu.year}</div>
                    <h3>${edu.degree}</h3>
                    <div class="timeline-institution">${edu.institution}</div>
                    <p class="timeline-description">${edu.description || ''}</p>
                </div>
            </div>
        `).join('');
    } else {
        container.innerHTML = '<p style="text-align: center; color: #666;">Education history will appear here.</p>';
    }
}

// Load Projects for count
// Projects count is handled during initial load in DOMContentLoaded
function loadProjects() {
    // no-op (kept for compatibility)
}

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

// Setup Scroll to Top Button
function setupScrollButton() {
    const scrollBtn = document.getElementById('scrollTopBtn');
    
    if (scrollBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollBtn.classList.add('show');
            } else {
                scrollBtn.classList.remove('show');
            }
        });
        
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Add animation on scroll for elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe skill cards, info cards, and timeline items
setTimeout(() => {
    document.querySelectorAll('.skill-card, .info-card, .timeline-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}, 100);
