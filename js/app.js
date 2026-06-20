/* ─── Global error display ──────────────────────────────── */
window.onerror = function(msg, src, line) {
  var el = document.getElementById('content-area');
  if (el) el.innerHTML = '<div style="color:#f07178;padding:20px;font-family:monospace;font-size:13px"><strong>JS Error:</strong><br>' + msg + '<br>' + src + ':' + line + '</div>';
};

/* ─── State ──────────────────────────────────────────────── */
const state = {
  platform: 'android',
  section: 'basics',
  activeTopicId: null,
  searchQuery: ''
};

/* ─── Data map (initialized in init to avoid TDZ issues) ─── */
var DATA;

/* ─── Accent colors ─────────────────────────────────────── */
const ACCENT = {
  android: { color: '--android', dim: '--android-dim' },
  ios:     { color: '--ios',     dim: '--ios-dim' }
};

/* ─── DOM refs ───────────────────────────────────────────── */
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

let dom = {};

function initDOMRefs() {
  dom = {
    contentArea:    $('#content-area'),
    sectionNav:     $('#section-nav'),
    searchInput:    $('#search-input'),
    sidebarSearch:  $('#sidebar-search'),
    sidebarNav:     $('#sidebar-nav'),
    platformTabs:   $$('.platform-tab'),
    searchHeader:   $('#search-results-header'),
    headerDot:      $('#header-dot'),
    headerTitle:    $('#header-title-text')
  };
}

/* ─── Accent CSS vars ────────────────────────────────────── */
function applyAccent(platform) {
  const root = document.documentElement;
  if (platform === 'android') {
    root.style.setProperty('--accent', '#3ddc84');
    root.style.setProperty('--accent-dim', 'rgba(61,220,132,0.12)');
  } else {
    root.style.setProperty('--accent', '#007aff');
    root.style.setProperty('--accent-dim', 'rgba(0,122,255,0.12)');
  }
}

/* ─── Render sidebar ─────────────────────────────────────── */
function renderSidebar() {
  if (!dom.sidebarNav) return;
  const platforms = ['android', 'ios'];
  const sections  = ['basics', 'senior'];
  const labels = {
    android: '🤖 Android', ios: '🍎 iOS',
    basics: 'Básicos', senior: 'Senior'
  };

  dom.sidebarNav.innerHTML = platforms.map(pl => {
    const items = sections.map(sec => {
      const topics = DATA[pl][sec];
      const isActiveSec = state.platform === pl && state.section === sec;
      return `
        <div class="sidebar-section-header ${isActiveSec ? 'active' : ''}"
             data-platform="${pl}" data-section="${sec}">
          ${labels[sec]}
        </div>
        <div class="sidebar-section-items" data-platform="${pl}" data-section="${sec}">
          ${topics.map(t => `
            <div class="sidebar-item ${state.activeTopicId === t.id && state.platform === pl ? 'active' : ''}"
                 data-platform="${pl}" data-section="${sec}" data-topic="${t.id}">
              <span class="sidebar-item-icon">${t.icon}</span>
              <span>${t.title}</span>
            </div>
          `).join('')}
        </div>`;
    }).join('');
    return `
      <div class="sidebar-platform-header">${labels[pl]}</div>
      ${items}`;
  }).join('');

  // Show/hide section items
  $$('.sidebar-section-items').forEach(el => {
    const pl = el.dataset.platform;
    const sec = el.dataset.section;
    el.style.display = (state.platform === pl && state.section === sec) ? 'block' : 'none';
  });

  // Events
  $$('.sidebar-section-header', dom.sidebarNav).forEach(el => {
    el.addEventListener('click', () => {
      navigateTo(el.dataset.platform, el.dataset.section);
    });
  });

  $$('.sidebar-item', dom.sidebarNav).forEach(el => {
    el.addEventListener('click', () => {
      navigateTo(el.dataset.platform, el.dataset.section);
      setTimeout(() => openTopic(el.dataset.topic), 50);
    });
  });
}

/* ─── Render section nav pills ───────────────────────────── */
function renderSectionNav() {
  if (!dom.sectionNav) return;
  const sections = [
    { id: 'basics', label: state.platform === 'android' ? '⚡ Básicos' : '🌱 Básicos' },
    { id: 'senior', label: '🚀 Senior' }
  ];
  dom.sectionNav.innerHTML = sections.map(s =>
    `<button class="section-btn ${state.section === s.id ? 'active' : ''}"
             data-section="${s.id}">${s.label}</button>`
  ).join('');
  $$('.section-btn', dom.sectionNav).forEach(btn => {
    btn.addEventListener('click', () => navigateTo(state.platform, btn.dataset.section));
  });
}

/* ─── Render topic cards ─────────────────────────────────── */
function renderCards(topics, highlight = '') {
  if (!dom.contentArea) return;
  if (!topics.length) {
    dom.contentArea.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🔍</span>
        <p>No se encontraron resultados para "${highlight}"</p>
      </div>`;
    return;
  }
  dom.contentArea.innerHTML = topics.map(topic => buildCard(topic, highlight)).join('');
  attachCardEvents();
  initCodeCopy();

  // Restore syntax highlighting
  if (window.Prism) Prism.highlightAll();

  // Open previously active topic
  if (state.activeTopicId && !highlight) {
    const card = document.getElementById(`card-${state.activeTopicId}`);
    if (card) openCard(card, false);
  }
}

function buildCard(topic, highlight = '') {
  const titleHtml = highlight
    ? highlightText(topic.title, highlight)
    : escapeHtml(topic.title);
  const summaryHtml = highlight
    ? highlightText(topic.summary, highlight)
    : escapeHtml(topic.summary);

  return `
    <div class="topic-card" id="card-${topic.id}" data-id="${topic.id}">
      <div class="topic-card-header" role="button" aria-expanded="false" tabindex="0">
        <span class="topic-icon">${topic.icon}</span>
        <div class="topic-meta">
          <div class="topic-title">${titleHtml}</div>
          <div class="topic-summary">${summaryHtml}</div>
        </div>
        <svg class="topic-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="topic-body" id="body-${topic.id}">
        <div class="topic-body-inner">
          ${topic.content.map(block => renderBlock(block)).join('')}
        </div>
      </div>
    </div>`;
}

function renderBlock(block) {
  switch (block.type) {
    case 'text':
      return `<div class="content-block text-block">${block.body}</div>`;
    case 'code':
      return `
        <div class="content-block code-block">
          <div class="code-lang-badge">
            <span>${block.lang || 'code'}</span>
            <button class="copy-btn" data-code="${encodeURIComponent(block.code)}">Copiar</button>
          </div>
          <pre class="language-${block.lang || 'plaintext'}"><code class="language-${block.lang || 'plaintext'}">${escapeHtml(block.code)}</code></pre>
        </div>`;
    case 'tip':
      return `<div class="content-block tip-block">${block.body}</div>`;
    case 'warning':
      return `<div class="content-block warning-block">${block.body}</div>`;
    default:
      return '';
  }
}

/* ─── Card interactions ──────────────────────────────────── */
function attachCardEvents() {
  $$('.topic-card-header').forEach(header => {
    header.addEventListener('click', () => toggleCard(header.closest('.topic-card')));
    header.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCard(header.closest('.topic-card'));
      }
    });
  });
}

function toggleCard(card) {
  const isActive = card.classList.contains('active');
  // Close all
  $$('.topic-card.active').forEach(c => closeCard(c));
  if (!isActive) openCard(card, true);
  else state.activeTopicId = null;
}

function openCard(card, scroll = true) {
  const body = card.querySelector('.topic-body');
  const header = card.querySelector('.topic-card-header');
  card.classList.add('active');
  header.setAttribute('aria-expanded', 'true');
  body.style.maxHeight = body.scrollHeight + 'px';
  state.activeTopicId = card.dataset.id;
  updateSidebarActive();
  if (scroll) {
    setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  }
}

function closeCard(card) {
  const body = card.querySelector('.topic-body');
  const header = card.querySelector('.topic-card-header');
  card.classList.remove('active');
  header.setAttribute('aria-expanded', 'false');
  body.style.maxHeight = '0';
}

function openTopic(topicId) {
  const card = document.getElementById(`card-${topicId}`);
  if (card) {
    $$('.topic-card.active').forEach(c => closeCard(c));
    openCard(card, true);
  }
}

/* ─── Copy code ──────────────────────────────────────────── */
function initCodeCopy() {
  $$('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const code = decodeURIComponent(btn.dataset.code);
      try {
        await navigator.clipboard.writeText(code);
        btn.textContent = '✓ Copiado';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copiar';
          btn.classList.remove('copied');
        }, 2000);
      } catch {
        btn.textContent = 'Error';
        setTimeout(() => { btn.textContent = 'Copiar'; }, 1500);
      }
    });
  });
}

/* ─── Search ─────────────────────────────────────────────── */
function onSearch(query) {
  state.searchQuery = query.trim();
  if (!state.searchQuery) {
    showNormalView();
    return;
  }
  showSearchResults(state.searchQuery);
}

function showSearchResults(query) {
  const q = query.toLowerCase();
  // Search across ALL sections of current platform
  const results = [];
  ['basics', 'senior'].forEach(sec => {
    DATA[state.platform][sec].forEach(topic => {
      if (topic.title.toLowerCase().includes(q) || topic.summary.toLowerCase().includes(q)) {
        results.push(topic);
      }
    });
  });

  if (dom.searchHeader) {
    dom.searchHeader.textContent = `${results.length} resultado${results.length !== 1 ? 's' : ''} para "${query}"`;
    dom.searchHeader.classList.add('visible');
  }
  dom.sectionNav.style.display = 'none';
  renderCards(results, query);
}

function showNormalView() {
  if (dom.searchHeader) dom.searchHeader.classList.remove('visible');
  if (dom.sectionNav) dom.sectionNav.style.display = '';
  const topics = DATA[state.platform][state.section];
  renderCards(topics);
}

/* ─── Navigation ─────────────────────────────────────────── */
function navigateTo(platform, section) {
  const platformChanged = state.platform !== platform;
  state.platform = platform;
  state.section = section;

  if (platformChanged) {
    state.activeTopicId = null;
    applyAccent(platform);
    updatePlatformTabs();
    updateHeaderDot();
  }

  // Clear search
  if (dom.searchInput) dom.searchInput.value = '';
  if (dom.sidebarSearch) dom.sidebarSearch.value = '';
  state.searchQuery = '';
  if (dom.searchHeader) dom.searchHeader.classList.remove('visible');

  renderSectionNav();
  renderSidebar();
  showNormalView();
}

function updatePlatformTabs() {
  dom.platformTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.platform === state.platform);
  });
}

function updateHeaderDot() {
  if (dom.headerDot) {
    dom.headerDot.className = `platform-dot ${state.platform}`;
  }
  if (dom.headerTitle) {
    dom.headerTitle.textContent = state.platform === 'android' ? 'Mobile Dev Guide' : 'Mobile Dev Guide';
  }
}

function updateSidebarActive() {
  $$('.sidebar-item').forEach(el => {
    el.classList.toggle('active',
      el.dataset.topic === state.activeTopicId &&
      el.dataset.platform === state.platform &&
      el.dataset.section === state.section
    );
  });
}

/* ─── Init ───────────────────────────────────────────────── */
function init() {
  DATA = {
    android: { basics: androidBasics, senior: androidSenior },
    ios:     { basics: iosBasics,     senior: iosSenior }
  };
  initDOMRefs();
  applyAccent(state.platform);
  updatePlatformTabs();
  renderSectionNav();
  renderSidebar();
  showNormalView();

  // Platform tab clicks
  dom.platformTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      navigateTo(tab.dataset.platform, 'basics');
    });
  });

  // Mobile search
  if (dom.searchInput) {
    dom.searchInput.addEventListener('input', e => onSearch(e.target.value));
  }

  // Sidebar search
  if (dom.sidebarSearch) {
    dom.sidebarSearch.addEventListener('input', e => onSearch(e.target.value));
  }
}

document.addEventListener('DOMContentLoaded', init);

/* ─── Helpers ────────────────────────────────────────────── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlightText(text, query) {
  const escaped = escapeHtml(text);
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escaped.replace(
    new RegExp(`(${escapedQuery})`, 'gi'),
    '<mark class="search-highlight">$1</mark>'
  );
}
