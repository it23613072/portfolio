// Projects Page Script

// Track if we've already scrolled
let hasScrolled = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProjectsData();
    setupFilterButtons();
    setupVideoAutoplay();
    setupScrollAnimations();
    setupModalHandlers();
});

// Load projects from admin API
async function loadProjectsData() {
    try {
        const response = await fetch('data/projects.json');
        const data = await response.json();
        const projects = Array.isArray(data) ? data : (data.projects || []);

        if (projects && Array.isArray(projects) && projects.length > 0) {
            displayProjects(projects);
            extractTechnologies(projects);
        } else {
            displayEmptyState();
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        displayEmptyState();
    }
}

// Display projects in grid
function displayProjects(projects) {
    const container = document.querySelector('.projects-grid');
    
    if (projects.length === 0) {
        displayEmptyState();
        return;
    }

    container.innerHTML = projects.map((project, index) => `
        <div class="project-card" data-category="${project.category || 'web'}" data-index="${index}" onclick="openProjectModal(${index}, '${escapeHtml(project.title)}', '${escapeHtml(project.description)}', '${escapeHtml(project.technologies || '')}', '${escapeHtml(project.link || '')}', '${escapeHtml(project.videoUrl || '')}')">
            <div class="project-thumbnail" style="position: relative;">
                ${project.videoUrl ? `
                    <video preload="metadata" data-index="${index}">
                        <source src="${project.videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                ` : `
                    <img src="${(project.images && project.images.length>0)?project.images[0]:getGithubThumbnail(project.link)}" alt="${project.title}" onerror="this.src='https://via.placeholder.com/400x250?text=Project'" style="width:100%;height:100%;object-fit:cover;">
                `}
                ${project.link ? `<a href="${project.link}" class="project-github-link" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();"><i class="fab fa-github"></i></a>` : ''}
            </div>
            <div class="project-info">
                <span class="project-category">${project.category || 'Web'}</span>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-techs">
                    ${(project.technologies || '').split(',').slice(0, 3).map(tech => 
                        `<span class="tech-badge">${tech.trim()}</span>`
                    ).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // Setup video autoplay on intersection
    setupVideoAutoplay();
}

// Extract and display technologies
function extractTechnologies(projects) {
    const techSet = new Set();
    const techIcons = {
        'JavaScript': 'fab fa-js-square',
        'React': 'fab fa-react',
        'Node.js': 'fab fa-node',
        'Python': 'fab fa-python',
        'MongoDB': 'fas fa-database',
        'Express': 'fas fa-server',
        'HTML5': 'fab fa-html5',
        'CSS3': 'fab fa-css3-alt',
        'Vue': 'fab fa-vuejs',
        'Angular': 'fab fa-angular',
        'TypeScript': 'fab fa-js-square',
        'GraphQL': 'fas fa-code',
        'AWS': 'fab fa-aws',
        'Docker': 'fab fa-docker',
        'Git': 'fab fa-git-alt',
        'SQL': 'fas fa-database',
        'Java': 'fab fa-java',
        'C++': 'fas fa-code',
        'Bootstrap': 'fab fa-bootstrap',
        'Tailwind': 'fas fa-palette'
    };

    projects.forEach(project => {
        if (project.technologies) {
            project.technologies.split(',').forEach(tech => {
                techSet.add(tech.trim());
            });
        }
    });

    const techGrid = document.getElementById('techStack');
    techGrid.innerHTML = Array.from(techSet).slice(0, 12).map(tech => `
        <div class="tech-item">
            <div class="tech-icon">
                <i class="${techIcons[tech] || 'fas fa-code'}"></i>
            </div>
            <div class="tech-name">${tech}</div>
        </div>
    `).join('');
}

// Setup filter buttons
function setupFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            filterProjects(filter);
        });
    });
}

// Filter projects by category
function filterProjects(category) {
    const cards = document.querySelectorAll('.project-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
            card.style.animation = 'slideUp 0.4s ease';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Show empty state if no results
    if (visibleCount === 0) {
        const grid = document.querySelector('.projects-grid');
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-search"></i>
                <h3>No projects found</h3>
                <p>Try a different filter or check back soon!</p>
            </div>
        `;
    }
}

// Video autoplay on scroll (Intersection Observer)
function setupVideoAutoplay() {
    const videos = document.querySelectorAll('.project-thumbnail video');
    
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.play().catch(err => console.log('Autoplay prevented:', err));
                video.muted = true;
                video.loop = true;
            } else {
                video.pause();
            }
        });
    }, {
        threshold: 0.5
    });

    videos.forEach(video => {
        videoObserver.observe(video);
        // Start playing immediately if in view
        if (isElementInViewport(video)) {
            video.play().catch(err => console.log('Autoplay prevented:', err));
            video.muted = true;
            video.loop = true;
        }
    });
}

// Check if element is in viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
    );
}

// Setup scroll animations
function setupScrollAnimations() {
    const cards = document.querySelectorAll('.project-card');
    
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideUp 0.6s ease forwards';
                cardObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });

    cards.forEach(card => cardObserver.observe(card));
}

// Modal handlers
function setupModalHandlers() {
    const modal = document.getElementById('projectModal');
    const closeBtn = document.querySelector('.close-modal');
    
    closeBtn.addEventListener('click', closeProjectModal);
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeProjectModal();
        }
    });
}

// Open project modal
window.openProjectModal = function(index, title, description, technologies, link, videoUrl) {
    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalTechs = document.getElementById('modalTechs');
    const modalLink = document.getElementById('modalLink');
    const modalVideo = document.getElementById('modalVideo');
    
    modalTitle.textContent = decodeHtml(title);
    modalDescription.textContent = decodeHtml(description);
    
    // Display technologies
    const techsContainer = document.querySelector('.modal-technologies');
    techsContainer.innerHTML = decodeHtml(technologies)
        .split(',')
        .map(tech => `<span class="tech-tag">${tech.trim()}</span>`)
        .join('');
    
    if (link && link !== '') {
        modalLink.href = decodeHtml(link);
        modalLink.style.display = 'inline-block';
    } else {
        modalLink.style.display = 'none';
    }
    
    if (videoUrl && videoUrl !== '') {
        modalVideo.src = decodeHtml(videoUrl);
        modalVideo.parentElement.style.display = 'block';
        modalVideo.play().catch(err => console.log('Video autoplay prevented:', err));
    } else {
        modalVideo.parentElement.style.display = 'none';
    }
    // Show GitHub link button if provided
    const modalLinkBtn = document.getElementById('modalLink');
    if (link && link !== '') {
        modalLinkBtn.href = decodeHtml(link);
        modalLinkBtn.style.display = 'inline-block';
    } else {
        modalLinkBtn.style.display = 'none';
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
};

// Helper to produce GitHub OG thumbnail
function getGithubThumbnail(link) {
    try {
        if (!link) return 'https://via.placeholder.com/400x250?text=Project';
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
    return 'https://via.placeholder.com/400x250?text=Project';
}

// Close project modal
function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    const modalVideo = document.getElementById('modalVideo');
    
    modalVideo.pause();
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Display empty state
function displayEmptyState() {
    const container = document.querySelector('.projects-grid');
    container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            <i class="fas fa-inbox"></i>
            <h3>No Projects Yet</h3>
            <p>Projects will appear here. Add them from your admin dashboard!</p>
        </div>
    `;
}

// Escape HTML special characters
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Decode HTML entities
function decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

// Smooth scroll on navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#projects') {
            e.preventDefault();
        }
    });
});

// Keyboard support for modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('projectModal');
        if (modal.style.display === 'block') {
            closeProjectModal();
        }
    }
});
