// ===== DATA LOADING AND RENDERING =====

async function loadJSON(filepath) {
  try {
    const response = await fetch(filepath);
    if (!response.ok) throw new Error(`Failed to load ${filepath}`);
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${filepath}:`, error);
    return null;
  }
}

// ===== RENDER RESEARCH =====
async function renderResearch() {
  const data = await loadJSON('data/research.json');
  if (!data) return;

  const grid = document.getElementById('research-grid');
  grid.innerHTML = data.map((item, idx) => `
    <div class="research-card" style="animation-delay: ${idx * 0.1}s">
      <div class="research-header">
        <div class="research-icon" data-icon="${item.icon}">
          ${getIconEmoji(item.icon)}
        </div>
        <div class="research-titles">
          <h3 class="research-title">${item.title}</h3>
          <p class="research-title-en">${item.titleEn}</p>
        </div>
      </div>
      <p class="research-description">${item.description}</p>
      <div class="research-tags">
        ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
      ${item.image ? `<img src="${item.image}" alt="${item.title}" class="research-image">` : ''}
      ${item.pdf ? `<a href="${item.pdf}" target="_blank" class="research-pdf">📄 詳細を見る</a>` : ''}
    </div>
  `).join('');
}

function getIconEmoji(icon) {
  const iconMap = {
    concrete: '🏗️',
    ai: '🤖',
    eco: '♻️',
    mobile: '📱',
    wood: '🌳',
    thermal: '🔥'
  };
  return iconMap[icon] || '⭐';
}

// ===== RENDER PROFESSOR / ABOUT =====
async function renderAbout() {
  const data = await loadJSON('data/members.json');
  if (!data || !data.professor) return;

  const prof = data.professor;
  const card = document.getElementById('professor-card');

  card.innerHTML = `
    <div class="professor-content">
      <div class="professor-photo-wrapper">
        <img src="${prof.photo}" alt="${prof.name}" class="professor-photo">
        <div class="photo-border"></div>
      </div>
      <div class="professor-info">
        <div class="professor-name-section">
          <h3 class="professor-name">${prof.name}</h3>
          <p class="professor-name-en">${prof.nameEn}</p>
        </div>
        <p class="professor-affiliation">${prof.affiliation}</p>
        <div class="professor-details">
          <div class="detail-item">
            <strong>専門分野</strong>
            <p>${prof.specialty}</p>
          </div>
          <div class="detail-item">
            <strong>学位</strong>
            <p>${prof.degree}</p>
          </div>
        </div>
        <p class="professor-bio">${prof.research}</p>
      </div>
    </div>
  `;
}

// ===== RENDER MEMBERS =====
async function renderMembers() {
  const data = await loadJSON('data/members.json');
  if (!data || !data.students) return;

  const year = data.year || '2026';
  document.getElementById('members-year').textContent = `${year}年度`;

  const grid = document.getElementById('members-grid');
  grid.innerHTML = data.students.map((student, idx) => `
    <div class="member-card" style="animation-delay: ${idx * 0.1}s">
      <div class="member-photo-wrapper">
        <img src="${student.photo}" alt="${student.name}" class="member-photo">
        <div class="member-glow"></div>
      </div>
      <h4 class="member-name">${student.name}</h4>
      <p class="member-grade">${student.grade}</p>
    </div>
  `).join('');
}

// ===== RENDER NEWS =====
async function renderNews() {
  const data = await loadJSON('data/news.json');
  if (!data) return;

  const container = document.getElementById('news-container');
  container.innerHTML = data.map((item, idx) => `
    <div class="news-card" style="animation-delay: ${idx * 0.1}s">
      <div class="news-header">
        <span class="news-date">${item.date}</span>
        <span class="news-category news-category-${item.category.toLowerCase()}">${item.category}</span>
      </div>
      <h3 class="news-title">${item.title}</h3>
      <p class="news-description">${item.description}</p>
      ${item.image ? `<img src="${item.image}" alt="${item.title}" class="news-image">` : ''}
      ${item.link ? `<a href="${item.link}" target="_blank" class="news-link">詳しく見る →</a>` : ''}
    </div>
  `).join('');
}

// ===== RENDER VIDEOS =====
async function renderVideos() {
  const data = await loadJSON('data/videos.json');
  if (!data) return;

  const grid = document.getElementById('videos-grid');
  grid.innerHTML = data.map((item, idx) => `
    <div class="video-card" style="animation-delay: ${idx * 0.1}s">
      <div class="video-embed">
        ${item.embedId
          ? `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${item.embedId}"
               title="${item.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write;
               encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
          : `<div class="video-placeholder"><p>動画ID未設定</p></div>`
        }
      </div>
      <h4 class="video-title">${item.title}</h4>
      <p class="video-description">${item.description}</p>
      <p class="video-date">${item.date}</p>
    </div>
  `).join('');
}

// ===== RENDER PUBLICATIONS =====
async function renderPublications() {
  const data = await loadJSON('data/publications.json');
  if (!data) return;

  const tabsContainer = document.getElementById('pub-tabs');
  const contentContainer = document.getElementById('pub-content');

  // Create tabs
  const categories = ['reviewed', 'international', 'domestic'];
  const categoryLabels = {
    reviewed: '査読付き論文',
    international: '国際学会',
    domestic: '国内学会'
  };

  tabsContainer.innerHTML = categories.map(cat => `
    <button class="pub-tab ${cat === 'reviewed' ? 'active' : ''}" data-category="${cat}">
      ${categoryLabels[cat]}
    </button>
  `).join('');

  // Render initial content (reviewed)
  renderPublicationContent('reviewed', data);

  // Add tab event listeners
  document.querySelectorAll('.pub-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.pub-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderPublicationContent(tab.dataset.category, data);
    });
  });
}

function renderPublicationContent(category, allData) {
  const contentContainer = document.getElementById('pub-content');
  const categoryData = allData[category];

  if (!categoryData) {
    contentContainer.innerHTML = '<p>データがありません</p>';
    return;
  }

  let html = '';
  categoryData.forEach(yearGroup => {
    html += `
      <div class="pub-year-group">
        <h4 class="pub-year">${yearGroup.year}</h4>
        <ul class="pub-list">
          ${yearGroup.items.map(item => `
            <li class="pub-item">${item}</li>
          `).join('')}
        </ul>
      </div>
    `;
  });

  contentContainer.innerHTML = html;
}

// ===== NAVIGATION SCROLL EFFECT =====
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  let lastScrollY = 0;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScrollY = currentScrollY;
  });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.research-card, .member-card, .news-card, .video-card').forEach(el => {
    observer.observe(el);
  });
}

// ===== SMOOTH SCROLL FOR NAVIGATION =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ===== HERO SCROLL INDICATOR =====
function initScrollIndicator() {
  const indicator = document.querySelector('.scroll-indicator');
  if (indicator) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 200) {
        indicator.style.opacity = '0';
        indicator.style.pointerEvents = 'none';
      } else {
        indicator.style.opacity = '1';
        indicator.style.pointerEvents = 'auto';
      }
    });
  }
}

// ===== INIT ALL =====
async function initAll() {
  initNavbar();
  initSmoothScroll();
  initScrollIndicator();

  // Load data
  await renderResearch();
  await renderAbout();
  await renderMembers();
  await renderNews();
  await renderVideos();
  await renderPublications();

  // Scroll animations (after content is loaded)
  setTimeout(initScrollAnimations, 100);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
