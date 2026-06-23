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

/* ─── Study Program data ─────────────────────────────────── */
const PROGRAM = [
  {
    title: 'Fase 1 — Arquitectura & Principios',
    duration: '5-7 días',
    icon: '🏛️',
    description: 'La base de cualquier Senior Dev. SOLID y patrones de diseño son los temas más recurrentes en entrevistas técnicas.',
    lessons: [
      { platform: 'android', section: 'senior', id: 'solid-principles', icon: '🔷', label: 'Principios SOLID en Kotlin' },
      { platform: 'android', section: 'senior', id: 'design-patterns', icon: '🧩', label: 'Patrones de Diseño para Mobile' },
      { platform: 'android', section: 'senior', id: 'architecture', icon: '🏛️', label: 'Clean Architecture + MVVM/MVI' },
      { platform: 'android', section: 'senior', id: 'hilt', icon: '💉', label: 'Hilt — Inyección de Dependencias' }
    ]
  },
  {
    title: 'Fase 2 — Kotlin Avanzado',
    duration: '4-5 días',
    icon: '⚡',
    description: 'Kotlin es el lenguaje principal de Revolut. Dominar coroutines y flow te diferencia en la entrevista técnica.',
    lessons: [
      { platform: 'android', section: 'senior', id: 'coroutines', icon: '⚡', label: 'Kotlin Coroutines' },
      { platform: 'android', section: 'senior', id: 'flow', icon: '🌊', label: 'Kotlin Flow' },
      { platform: 'android', section: 'senior', id: 'kotlin-advanced', icon: '🔬', label: 'Kotlin Avanzado' },
      { platform: 'android', section: 'senior', id: 'reactive', icon: '🔄', label: 'Programación Reactiva' }
    ]
  },
  {
    title: 'Fase 3 — Android Core',
    duration: '4-5 días',
    icon: '🤖',
    description: 'Compose es el futuro de la UI en Android. Testing y performance son diferenciadores clave a nivel Senior.',
    lessons: [
      { platform: 'android', section: 'senior', id: 'compose', icon: '✨', label: 'Jetpack Compose' },
      { platform: 'android', section: 'senior', id: 'testing', icon: '🧪', label: 'Testing en Android' },
      { platform: 'android', section: 'senior', id: 'performance', icon: '🚀', label: 'Performance & Memory' },
      { platform: 'android', section: 'basics', id: 'viewmodel', icon: '🧠', label: 'ViewModel (repaso + quiz)' },
      { platform: 'android', section: 'basics', id: 'room', icon: '🗄️', label: 'Room Database (repaso + quiz)' }
    ]
  },
  {
    title: 'Fase 4 — Especialización Revolut',
    duration: '3-4 días',
    icon: '💳',
    description: 'Temas críticos para apps fintech. Security y Modularization son frecuentes en procesos de selección de Revolut.',
    lessons: [
      { platform: 'android', section: 'senior', id: 'security-android', icon: '🔒', label: 'Seguridad en Android (Fintech)' },
      { platform: 'android', section: 'senior', id: 'modularization', icon: '📦', label: 'Modularización & Multi-módulo' }
    ]
  },
  {
    title: 'Fase 5 — iOS & Repaso Final',
    duration: '3-4 días',
    icon: '🍎',
    description: 'Si el rol es cross-platform, domina la concurrencia en Swift. Repasa con los quizzes los temas más difíciles.',
    lessons: [
      { platform: 'ios', section: 'senior', id: 'async-await', icon: '⚡', label: 'async/await y Swift Concurrency' },
      { platform: 'ios', section: 'senior', id: 'actors', icon: '🔒', label: 'Actors y @MainActor' },
      { platform: 'ios', section: 'senior', id: 'architecture-ios', icon: '🏛️', label: 'Arquitectura MVVM y TCA' }
    ]
  }
];

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
    { id: 'senior', label: '🚀 Senior' },
    { id: 'program', label: '📋 Programa' }
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
  initQuizEvents();

  if (window.Prism) Prism.highlightAll();

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
  const quizHtml = topic.quiz ? buildQuiz(topic.quiz, topic.id) : '';

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
          ${quizHtml}
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
  // After animation completes, release constraint so quiz can expand freely
  setTimeout(() => {
    if (card.classList.contains('active')) body.style.maxHeight = 'none';
  }, 380);
  if (scroll) {
    setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  }
}

function closeCard(card) {
  const body = card.querySelector('.topic-body');
  const header = card.querySelector('.topic-card-header');
  card.classList.remove('active');
  header.setAttribute('aria-expanded', 'false');
  // Constrain before animating to 0
  body.style.maxHeight = body.scrollHeight + 'px';
  requestAnimationFrame(() => { body.style.maxHeight = '0'; });
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
  if (state.section === 'program') {
    renderProgram();
    return;
  }
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

/* ─── Quiz ───────────────────────────────────────────────── */
function buildQuiz(quiz, topicId) {
  if (!quiz || !quiz.questions || !quiz.questions.length) return '';
  const total = quiz.questions.length;
  const questionsHtml = quiz.questions.map((q, qi) => {
    const codeHtml = q.code
      ? `<div class="quiz-code"><pre class="language-kotlin"><code class="language-kotlin">${escapeHtml(q.code)}</code></pre></div>`
      : '';
    const optionsHtml = q.options.map((opt, oi) => `
      <div class="quiz-option" data-qi="${qi}" data-oi="${oi}">
        <span class="quiz-option-letter">${String.fromCharCode(65 + oi)}</span>
        <span class="quiz-option-text">${escapeHtml(opt)}</span>
      </div>`).join('');
    return `
      <div class="quiz-question-block" data-qi="${qi}" data-correct="${q.correct}">
        <div class="quiz-question-number">Pregunta ${qi + 1} de ${total}</div>
        <div class="quiz-question-text">${escapeHtml(q.question)}</div>
        ${codeHtml}
        <div class="quiz-options">${optionsHtml}</div>
        <div class="quiz-explanation" hidden>${escapeHtml(q.explanation)}</div>
      </div>`;
  }).join('');

  return `
    <div class="quiz-section" id="quiz-${topicId}" hidden>
      <div class="quiz-header">
        <span class="quiz-header-icon">🎯</span>
        <span>Quiz — ${total} pregunta${total !== 1 ? 's' : ''}</span>
      </div>
      ${questionsHtml}
      <div class="quiz-actions">
        <button class="quiz-submit-btn" data-quiz="${topicId}">Comprobar respuestas</button>
        <button class="quiz-retry-btn" data-quiz="${topicId}" hidden>🔄 Reintentar</button>
      </div>
      <div class="quiz-results" id="quiz-results-${topicId}" hidden></div>
    </div>
    <button class="quiz-toggle-btn" data-quiz="${topicId}">🎯 Practicar con Quiz</button>`;
}

function initQuizEvents() {
  $$('.quiz-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.quiz;
      const section = document.getElementById(`quiz-${id}`);
      if (!section) return;
      const isHidden = section.hidden;
      section.hidden = !isHidden;
      btn.textContent = isHidden ? '✕ Cerrar Quiz' : '🎯 Practicar con Quiz';
      if (isHidden && window.Prism) Prism.highlightAll();
      if (isHidden) setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
    });
  });

  $$('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => {
      if (opt.classList.contains('locked')) return;
      const qi = opt.dataset.qi;
      const block = opt.closest('.quiz-question-block');
      $$('.quiz-option', block).forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  $$('.quiz-submit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const quizId = btn.dataset.quiz;
      const section = document.getElementById(`quiz-${quizId}`);
      const blocks = $$('.quiz-question-block', section);
      let correct = 0, answered = 0;

      blocks.forEach(block => {
        const correctIdx = parseInt(block.dataset.correct, 10);
        const selected = block.querySelector('.quiz-option.selected');
        if (!selected) return;
        answered++;
        const selectedIdx = parseInt(selected.dataset.oi, 10);
        const allOpts = $$('.quiz-option', block);
        allOpts.forEach(o => o.classList.add('locked'));
        allOpts[correctIdx].classList.add('correct');
        if (selectedIdx === correctIdx) {
          correct++;
        } else {
          selected.classList.add('incorrect');
        }
        const expl = block.querySelector('.quiz-explanation');
        if (expl) expl.hidden = false;
      });

      if (answered === 0) return;

      const pct = Math.round((correct / blocks.length) * 100);
      const emoji = pct === 100 ? '🏆' : pct >= 70 ? '💪' : pct >= 50 ? '📚' : '🔄';
      const scoreColor = pct >= 70 ? '#3ddc84' : pct >= 50 ? '#ffaa00' : '#f07178';
      const resultsEl = document.getElementById(`quiz-results-${quizId}`);
      if (resultsEl) {
        resultsEl.hidden = false;
        resultsEl.innerHTML = `
          <span class="quiz-score-emoji">${emoji}</span>
          <div class="quiz-score-value" style="color:${scoreColor}">${pct}%</div>
          <div class="quiz-score-label">Has acertado ${correct} de ${blocks.length} preguntas</div>`;
      }
      btn.hidden = true;
      const retryBtn = section.querySelector('.quiz-retry-btn');
      if (retryBtn) retryBtn.hidden = false;
    });
  });

  $$('.quiz-retry-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const quizId = btn.dataset.quiz;
      const section = document.getElementById(`quiz-${quizId}`);
      $$('.quiz-option', section).forEach(o => o.classList.remove('selected', 'correct', 'incorrect', 'locked'));
      $$('.quiz-explanation', section).forEach(e => { e.hidden = true; });
      const resultsEl = document.getElementById(`quiz-results-${quizId}`);
      if (resultsEl) resultsEl.hidden = true;
      btn.hidden = true;
      const submitBtn = section.querySelector('.quiz-submit-btn');
      if (submitBtn) submitBtn.hidden = false;
    });
  });
}

/* ─── Program view ───────────────────────────────────────── */
function renderProgram() {
  if (!dom.contentArea) return;
  const phasesHtml = PROGRAM.map(phase => {
    const lessonsHtml = phase.lessons.map(l => `
      <div class="program-lesson-item"
           data-platform="${l.platform}" data-section="${l.section}" data-topic="${l.id}">
        <span class="program-lesson-icon">${l.icon}</span>
        <span class="program-lesson-label">${escapeHtml(l.label)}</span>
        <span class="program-lesson-arrow">→</span>
      </div>`).join('');
    return `
      <div class="program-phase">
        <div class="program-phase-header">
          <span class="program-phase-icon">${phase.icon}</span>
          <div>
            <div class="program-phase-title">${escapeHtml(phase.title)}</div>
            <div class="program-phase-duration">${escapeHtml(phase.duration)} estimados</div>
          </div>
        </div>
        <p class="program-phase-desc">${escapeHtml(phase.description)}</p>
        <div class="program-lessons">${lessonsHtml}</div>
      </div>`;
  }).join('');

  dom.contentArea.innerHTML = `
    <div class="program-view">
      <div class="program-hero">
        <h2>📋 Programa de Preparación</h2>
        <p>Revolut — Senior Mobile Developer</p>
      </div>
      <div class="program-phases">${phasesHtml}</div>
    </div>`;

  $$('.program-lesson-item').forEach(item => {
    item.addEventListener('click', () => {
      const { platform, section, topic } = item.dataset;
      navigateTo(platform, section);
      setTimeout(() => openTopic(topic), 80);
    });
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
