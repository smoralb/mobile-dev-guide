/* ─── Global error display ──────────────────────────────── */
window.onerror = function(msg, src, line) {
  var el = document.getElementById('content-area');
  if (el) el.innerHTML = '<div style="color:#f07178;padding:20px;font-family:monospace;font-size:13px"><strong>JS Error:</strong><br>' + msg + '<br>' + src + ':' + line + '</div>';
};

/* ─── State ──────────────────────────────────────────────── */
const state = {
  platform: 'android',
  section: 'program',
  activeTopicId: null,
  searchQuery: ''
};

/* ─── Progress persistence ───────────────────────────────── */
function loadProgress() {
  try {
    const raw = localStorage.getItem('mdg_progress');
    return raw ? JSON.parse(raw) : { android: { phases: {} }, ios: { phases: {} } };
  } catch { return { android: { phases: {} }, ios: { phases: {} } }; }
}

function saveProgress(p) {
  try { localStorage.setItem('mdg_progress', JSON.stringify(p)); } catch {}
}

const prog = loadProgress();

function ensurePhase(platform, phaseIdx) {
  const key = String(phaseIdx);
  if (!prog[platform].phases[key]) {
    prog[platform].phases[key] = { passed: false, lessons: {} };
  }
  return prog[platform].phases[key];
}

function isLessonComplete(platform, phaseIdx, lessonId) {
  const p = prog[platform].phases[String(phaseIdx)];
  return p ? !!p.lessons[lessonId] : false;
}

function markLessonComplete(platform, phaseIdx, lessonId) {
  ensurePhase(platform, phaseIdx);
  prog[platform].phases[String(phaseIdx)].lessons[lessonId] = true;
  saveProgress(prog);
}

function isPhaseUnlocked(platform, phaseIdx) {
  if (phaseIdx === 0) return true;
  const prev = prog[platform].phases[String(phaseIdx - 1)];
  return prev ? prev.passed : false;
}

function isPhasePassed(platform, phaseIdx) {
  const p = prog[platform].phases[String(phaseIdx)];
  return p ? p.passed : false;
}

function markPhasePassed(platform, phaseIdx) {
  ensurePhase(platform, phaseIdx);
  prog[platform].phases[String(phaseIdx)].passed = true;
  saveProgress(prog);
}

function getPhaseProgress(platform, phaseIdx) {
  const data = platform === 'android' ? ANDROID_PROGRAM : IOS_PROGRAM;
  const phase = data[phaseIdx];
  if (!phase) return { completed: 0, total: 0 };
  const total = phase.lessons.length;
  let completed = 0;
  phase.lessons.forEach(l => { if (isLessonComplete(platform, phaseIdx, l.id)) completed++; });
  return { completed, total };
}

function getAllLessonsProgress(platform) {
  const data = platform === 'android' ? ANDROID_PROGRAM : IOS_PROGRAM;
  let completed = 0, total = 0;
  data.forEach((phase, pi) => {
    phase.lessons.forEach(l => {
      total++;
      if (isLessonComplete(platform, pi, l.id)) completed++;
    });
  });
  return { completed, total };
}

/* ─── Study Program data ─────────────────────────────────── */
const ANDROID_PROGRAM = [
  {
    title: 'Fase 1 — Arquitectura & Principios',
    duration: '5-7 días',
    icon: '\u{1F3DB}',
    description: 'La base de cualquier Senior Dev. SOLID y patrones de dise\u00F1o son los temas m\u00E1s recurrentes en entrevistas t\u00E9cnicas.',
    passThreshold: 0.8,
    lessons: [
      { platform: 'android', section: 'senior', id: 'solid-principles', icon: '\u{1F537}', label: 'Principios SOLID en Kotlin' },
      { platform: 'android', section: 'senior', id: 'design-patterns', icon: '\u{1F9E9}', label: 'Patrones de Dise\u00F1o para Mobile' },
      { platform: 'android', section: 'senior', id: 'architecture', icon: '\u{1F3DB}', label: 'Clean Architecture + MVVM/MVI' },
      { platform: 'android', section: 'senior', id: 'hilt', icon: '\u{1F489}', label: 'Hilt \u2014 Inyecci\u00F3n de Dependencias' }
    ]
  },
  {
    title: 'Fase 2 — Kotlin Avanzado',
    duration: '4-5 d\u00EDas',
    icon: '\u26A1',
    description: 'Kotlin es el lenguaje principal de Revolut. Dominar coroutines y flow te diferencia en la entrevista t\u00E9cnica.',
    passThreshold: 0.8,
    lessons: [
      { platform: 'android', section: 'senior', id: 'coroutines', icon: '\u26A1', label: 'Kotlin Coroutines' },
      { platform: 'android', section: 'senior', id: 'flow', icon: '\u{1F30A}', label: 'Kotlin Flow' },
      { platform: 'android', section: 'senior', id: 'kotlin-advanced', icon: '\u{1F52C}', label: 'Kotlin Avanzado' },
      { platform: 'android', section: 'senior', id: 'reactive', icon: '\u{1F504}', label: 'Programaci\u00F3n Reactiva' }
    ]
  },
  {
    title: 'Fase 3 — Android Core',
    duration: '4-5 d\u00EDas',
    icon: '\u{1F916}',
    description: 'Compose es el futuro de la UI en Android. Testing y performance son diferenciadores clave a nivel Senior.',
    passThreshold: 0.8,
    lessons: [
      { platform: 'android', section: 'senior', id: 'compose', icon: '\u2728', label: 'Jetpack Compose' },
      { platform: 'android', section: 'senior', id: 'testing', icon: '\u{1F9EA}', label: 'Testing en Android' },
      { platform: 'android', section: 'senior', id: 'performance', icon: '\u{1F680}', label: 'Performance & Memory' },
      { platform: 'android', section: 'basics', id: 'viewmodel', icon: '\u{1F9E0}', label: 'ViewModel (repaso + quiz)' },
      { platform: 'android', section: 'basics', id: 'room', icon: '\u{1F5C4}', label: 'Room Database (repaso + quiz)' }
    ]
  },
  {
    title: 'Fase 4 — Especializaci\u00F3n Revolut',
    duration: '3-4 d\u00EDas',
    icon: '\u{1F4B3}',
    description: 'Temas cr\u00EDticos para apps fintech. Security y Modularization son frecuentes en procesos de selecci\u00F3n de Revolut.',
    passThreshold: 0.8,
    lessons: [
      { platform: 'android', section: 'senior', id: 'security-android', icon: '\u{1F512}', label: 'Seguridad en Android (Fintech)' },
      { platform: 'android', section: 'senior', id: 'modularization', icon: '\u{1F4E6}', label: 'Modularizaci\u00F3n & Multi-m\u00F3dulo' }
    ]
  },
  {
    title: 'Fase 5 — iOS & Repaso Final',
    duration: '3-4 d\u00EDas',
    icon: '\u{1F34E}',
    description: 'Si el rol es cross-platform, domina la concurrencia en Swift. Repasa con los quizzes los temas m\u00E1s dif\u00EDciles.',
    passThreshold: 0.8,
    lessons: [
      { platform: 'ios', section: 'senior', id: 'async-await', icon: '\u26A1', label: 'async/await y Swift Concurrency' },
      { platform: 'ios', section: 'senior', id: 'actors', icon: '\u{1F512}', label: 'Actors y @MainActor' },
      { platform: 'ios', section: 'senior', id: 'architecture-ios', icon: '\u{1F3DB}', label: 'Arquitectura MVVM y TCA' }
    ]
  }
];

const IOS_PROGRAM = [
  {
    title: 'Fase 1 — Swift Essentials',
    duration: '4-5 d\u00EDas',
    icon: '\u{1F426}',
    description: 'Domina Swift: optionals, structs vs classes, el protocolo View, y los stacks de layout.',
    passThreshold: 0.8,
    lessons: [
      { platform: 'ios', section: 'basics', id: 'swift-essentials', icon: '\u{1F426}', label: 'Swift Esencial' },
      { platform: 'ios', section: 'basics', id: 'swiftui-view', icon: '\u{1F5BC}', label: 'View Protocol en SwiftUI' },
      { platform: 'ios', section: 'basics', id: 'common-views', icon: '\u{1F9F1}', label: 'Vistas Comunes' },
      { platform: 'ios', section: 'basics', id: 'layout', icon: '\u{1F4D0}', label: 'Layout: Stacks y Grids' }
    ]
  },
  {
    title: 'Fase 2 — State Management',
    duration: '4-5 d\u00EDas',
    icon: '\u{1F517}',
    description: 'Aprende los property wrappers de estado: @State, @Binding, @StateObject, @EnvironmentObject.',
    passThreshold: 0.8,
    lessons: [
      { platform: 'ios', section: 'basics', id: 'state', icon: '\u{1F535}', label: '@State' },
      { platform: 'ios', section: 'basics', id: 'binding', icon: '\u{1F517}', label: '@Binding' },
      { platform: 'ios', section: 'basics', id: 'stateobject-observedobject', icon: '\u{1F535}\u{1F7E1}', label: '@StateObject y @ObservedObject' },
      { platform: 'ios', section: 'basics', id: 'environment-object', icon: '\u{1F310}', label: '@EnvironmentObject' }
    ]
  },
  {
    title: 'Fase 3 — Navigation & UI',
    duration: '4-5 d\u00EDas',
    icon: '\u{1F5FA}',
    description: 'NavigationStack, TabView, List, Sheets y alerts. Construye interfaces complejas.',
    passThreshold: 0.8,
    lessons: [
      { platform: 'ios', section: 'basics', id: 'navigation-stack', icon: '\u{1F5FA}', label: 'NavigationStack' },
      { platform: 'ios', section: 'basics', id: 'tabview', icon: '\u{1F4D1}', label: 'TabView' },
      { platform: 'ios', section: 'basics', id: 'list-foreach', icon: '\u{1F4CB}', label: 'List y ForEach' },
      { platform: 'ios', section: 'basics', id: 'sheets-alerts', icon: '\u{1F4AC}', label: 'Sheets, Alerts y Dialogs' }
    ]
  },
  {
    title: 'Fase 4 — iOS Advanced',
    duration: '4-5 d\u00EDas',
    icon: '\u{1F4A1}',
    description: '@Observable, async/await, Tasks y Actors. Concurrencia moderna en Swift.',
    passThreshold: 0.8,
    lessons: [
      { platform: 'ios', section: 'senior', id: 'observable', icon: '\u{1F52D}', label: '@Observable (iOS 17+)' },
      { platform: 'ios', section: 'senior', id: 'async-await', icon: '\u26A1', label: 'async/await y Swift Concurrency' },
      { platform: 'ios', section: 'senior', id: 'task-taskgroup', icon: '\u{1F500}', label: 'Task y TaskGroup' },
      { platform: 'ios', section: 'senior', id: 'actors', icon: '\u{1F512}', label: 'Actors y @MainActor' }
    ]
  },
  {
    title: 'Fase 5 — Architecture & Polish',
    duration: '3-4 d\u00EDas',
    icon: '\u{2728}',
    description: 'MVVM/TCA, SwiftData, animation y testing. Perfecciona tu stack iOS.',
    passThreshold: 0.8,
    lessons: [
      { platform: 'ios', section: 'senior', id: 'architecture-ios', icon: '\u{1F3DB}', label: 'Arquitectura MVVM y TCA' },
      { platform: 'ios', section: 'senior', id: 'swiftdata', icon: '\u{1F4BE}', label: 'SwiftData' },
      { platform: 'ios', section: 'senior', id: 'animation', icon: '\u2728', label: 'Animaci\u00F3n y Transitions' },
      { platform: 'ios', section: 'senior', id: 'testing-ios', icon: '\u{1F9EA}', label: 'Testing en iOS' }
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
    android: '\u{1F916} Android', ios: '\u{1F34E} iOS',
    basics: 'B\u00E1sicos', senior: 'Senior'
  };

  dom.sidebarNav.innerHTML = platforms.map(pl => {
    const p = getAllLessonsProgress(pl);
    const pct = p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0;
    const items = sections.map(sec => {
      const topics = DATA[pl][sec];
      const isActiveSec = state.platform === pl && state.section === sec;
      return `
        <div class="sidebar-section-header ${isActiveSec ? 'active' : ''}"
             data-platform="${pl}" data-section="${sec}">
          ${labels[sec]}
        </div>
        <div class="sidebar-section-items" data-platform="${pl}" data-section="${sec}">
          ${topics.map(t => {
            const isComplete = checkTopicComplete(pl, t.id);
            return `
            <div class="sidebar-item ${state.activeTopicId === t.id && state.platform === pl ? 'active' : ''}"
                 data-platform="${pl}" data-section="${sec}" data-topic="${t.id}">
              <span class="sidebar-item-icon">${t.icon}</span>
              <span>${t.title}</span>
              ${isComplete ? '<span class="sidebar-item-check">\u2713</span>' : ''}
            </div>`;
          }).join('')}
        </div>`;
    }).join('');
    return `
      <div class="sidebar-platform-header">
        <span>${labels[pl]}</span>
        <span class="sidebar-progress-badge">${pct}%</span>
      </div>
      ${items}`;
  }).join('');

  $$('.sidebar-section-items').forEach(el => {
    const pl = el.dataset.platform;
    const sec = el.dataset.section;
    el.style.display = (state.platform === pl && state.section === sec) ? 'block' : 'none';
  });

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

function checkTopicComplete(platform, topicId) {
  const data = platform === 'android' ? ANDROID_PROGRAM : IOS_PROGRAM;
  for (let pi = 0; pi < data.length; pi++) {
    for (const l of data[pi].lessons) {
      if (l.id === topicId && l.platform === platform) {
        return isLessonComplete(platform, pi, topicId);
      }
    }
  }
  return false;
}

/* ─── Render section nav pills ───────────────────────────── */
function renderSectionNav() {
  if (!dom.sectionNav) return;
  const sections = [
    { id: 'program', label: '\u{1F4CB} Programa' },
    { id: 'basics', label: state.platform === 'android' ? '\u26A1 B\u00E1sicos' : '\u{1F331} B\u00E1sicos' },
    { id: 'senior', label: '\u{1F680} Senior' }
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
        <span class="empty-icon">\u{1F50D}</span>
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
        btn.textContent = '\u2713 Copiado';
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
    dom.headerTitle.textContent = 'Mobile Dev Guide';
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
        <span class="quiz-header-icon">\u{1F3AF}</span>
        <span>Quiz — ${total} pregunta${total !== 1 ? 's' : ''}</span>
      </div>
      ${questionsHtml}
      <div class="quiz-actions">
        <button class="quiz-submit-btn" data-quiz="${topicId}">Comprobar respuestas</button>
        <button class="quiz-retry-btn" data-quiz="${topicId}" hidden>\u{1F504} Reintentar</button>
      </div>
      <div class="quiz-results" id="quiz-results-${topicId}" hidden></div>
    </div>
    <button class="quiz-toggle-btn" data-quiz="${topicId}">\u{1F3AF} Practicar con Quiz</button>`;
}

function initQuizEvents() {
  $$('.quiz-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.quiz;
      const section = document.getElementById(`quiz-${id}`);
      if (!section) return;
      const isHidden = section.hidden;
      section.hidden = !isHidden;
      btn.textContent = isHidden ? '\u2715 Cerrar Quiz' : '\u{1F3AF} Practicar con Quiz';
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
      const emoji = pct === 100 ? '\u{1F3C6}' : pct >= 70 ? '\u{1F4AA}' : pct >= 50 ? '\u{1F4DA}' : '\u{1F504}';
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

/* ─── Program view (gamified) ────────────────────────────── */
function renderProgram() {
  if (!dom.contentArea) return;
  const data = state.platform === 'android' ? ANDROID_PROGRAM : IOS_PROGRAM;
  const platformLabel = state.platform === 'android' ? 'Android' : 'iOS';
  const totalP = getAllLessonsProgress(state.platform);
  const overallPct = totalP.total > 0 ? Math.round((totalP.completed / totalP.total) * 100) : 0;

  const phasesHtml = data.map((phase, pi) => {
    const unlocked = isPhaseUnlocked(state.platform, pi);
    const passed = isPhasePassed(state.platform, pi);
    const progress = getPhaseProgress(state.platform, pi);
    const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

    const lessonsHtml = phase.lessons.map(l => {
      const complete = isLessonComplete(state.platform, pi, l.id);
      const clickable = unlocked && !passed;
      return `
        <div class="program-lesson-item ${complete ? 'completed' : ''} ${!clickable ? 'locked' : ''}"
             data-platform="${l.platform}" data-section="${l.section}" data-topic="${l.id}">
          <span class="program-lesson-check">${complete ? '\u2705' : '\u{25CB}'}</span>
          <span class="program-lesson-icon">${l.icon}</span>
          <span class="program-lesson-label">${escapeHtml(l.label)}</span>
          ${!unlocked ? '<span class="program-lesson-lock">\u{1F512}</span>' : complete ? '<span class="program-lesson-done">Hecho</span>' : '<span class="program-lesson-arrow">\u2192</span>'}
        </div>`;
    }).join('');

    return `
      <div class="program-phase ${!unlocked ? 'phase-locked' : ''} ${passed ? 'phase-passed' : ''}" data-phase="${pi}">
        ${!unlocked ? '<div class="phase-lock-overlay"><span class="phase-lock-icon">\u{1F512}</span><span class="phase-lock-text">Completa la fase anterior</span></div>' : ''}
        <div class="program-phase-header">
          <span class="program-phase-icon">${phase.icon}</span>
          <div>
            <div class="program-phase-title">${escapeHtml(phase.title)}</div>
            <div class="program-phase-duration">${escapeHtml(phase.duration)} estimados</div>
          </div>
          ${passed ? '<span class="phase-passed-badge">\u2705 Completado</span>' : ''}
        </div>
        <p class="program-phase-desc">${escapeHtml(phase.description)}</p>
        ${unlocked ? `
        <div class="phase-progress-bar">
          <div class="phase-progress-fill" style="width:${pct}%"></div>
          <span class="phase-progress-text">${progress.completed}/${progress.total} lecciones</span>
        </div>
        <div class="program-lessons">${lessonsHtml}</div>` : `
        <div class="phase-progress-bar">
          <div class="phase-progress-fill" style="width:0%"></div>
          <span class="phase-progress-text">\u{1F512} Bloqueado</span>
        </div>`}
        ${unlocked && !passed ? renderPhaseQuiz(state.platform, pi) : ''}
      </div>`;
  }).join('');

  dom.contentArea.innerHTML = `
    <div class="program-view">
      <div class="program-hero">
        <h2>\u{1F4CB} Programa de Preparaci\u00F3n</h2>
        <p>${platformLabel} — Senior Mobile Developer</p>
        <div class="program-overall-progress">
          <div class="program-overall-bar">
            <div class="program-overall-fill" style="width:${overallPct}%"></div>
          </div>
          <span class="program-overall-text">${totalP.completed}/${totalP.total} temas completados (${overallPct}%)</span>
        </div>
      </div>
      <div class="program-phases">${phasesHtml}</div>
    </div>`;

  $$('.program-lesson-item:not(.locked)').forEach(item => {
    item.addEventListener('click', () => {
      const { platform, section, topic } = item.dataset;
      navigateTo(platform, section);
      setTimeout(() => openTopic(topic), 80);
    });
  });

  initPhaseQuizEvents();
}

/* ─── Phase Quiz (gate) ──────────────────────────────────── */
function renderPhaseQuiz(platform, phaseIdx) {
  const data = platform === 'android' ? ANDROID_PROGRAM : IOS_PROGRAM;
  const phase = data[phaseIdx];
  if (!phase || phase.lessons.length === 0) return '';

  const quizId = `phase-quiz-${platform}-${phaseIdx}`;
  const lessons = phase.lessons;

  let allQuestions = [];
  lessons.forEach(l => {
    const sectionData = DATA[l.platform][l.section];
    const topic = sectionData.find(t => t.id === l.id);
    if (topic && topic.quiz && topic.quiz.questions) {
      allQuestions = allQuestions.concat(topic.quiz.questions);
    }
  });

  if (allQuestions.length === 0) return '';

  const shuffled = shuffle(allQuestions).slice(0, 10);
  const total = shuffled.length;

  const questionsHtml = shuffled.map((q, qi) => {
    const codeHtml = q.code
      ? `<div class="quiz-code"><pre class="language-kotlin"><code class="language-kotlin">${escapeHtml(q.code)}</code></pre></div>`
      : '';
    const optionsHtml = q.options.map((opt, oi) => `
      <div class="quiz-option" data-pq="${quizId}" data-qi="${qi}" data-oi="${oi}">
        <span class="quiz-option-letter">${String.fromCharCode(65 + oi)}</span>
        <span class="quiz-option-text">${escapeHtml(opt)}</span>
      </div>`).join('');
    return `
      <div class="quiz-question-block" data-pq="${quizId}" data-qi="${qi}" data-correct="${q.correct}">
        <div class="quiz-question-number">Pregunta ${qi + 1} de ${total}</div>
        <div class="quiz-question-text">${escapeHtml(q.question)}</div>
        ${codeHtml}
        <div class="quiz-options">${optionsHtml}</div>
        <div class="quiz-explanation" hidden>${escapeHtml(q.explanation)}</div>
      </div>`;
  }).join('');

  return `
    <div class="phase-quiz-section">
      <div class="phase-quiz-divider">
        <span>\u{1F3AF} Quiz de Fase — Supera el ${Math.round(phase.passThreshold * 100)}% para desbloquear la siguiente fase</span>
      </div>
      <div class="quiz-section" id="${quizId}">
        <div class="quiz-header">
          <span class="quiz-header-icon">\u{1F3AF}</span>
          <span>Quiz de Fase — ${total} pregunta${total !== 1 ? 's' : ''}</span>
        </div>
        ${questionsHtml}
        <div class="quiz-actions">
          <button class="phase-quiz-submit-btn" data-quiz="${quizId}" data-platform="${platform}" data-phase="${phaseIdx}" data-threshold="${phase.passThreshold}">Enviar respuestas</button>
          <button class="quiz-retry-btn" data-quiz="${quizId}" hidden>\u{1F504} Reintentar</button>
        </div>
        <div class="quiz-results" id="results-${quizId}" hidden></div>
      </div>
    </div>`;
}

function initPhaseQuizEvents() {
  $$('.phase-quiz-submit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const quizId = btn.dataset.quiz;
      const platform = btn.dataset.platform;
      const phaseIdx = parseInt(btn.dataset.phase, 10);
      const threshold = parseFloat(btn.dataset.threshold);
      const section = document.getElementById(quizId);
      if (!section) return;
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

      const blocksTotal = blocks.length;
      const pct = Math.round((correct / blocksTotal) * 100);
      const passed = pct >= Math.round(threshold * 100);

      const resultsEl = document.getElementById(`results-${quizId}`);
      if (resultsEl) {
        resultsEl.hidden = false;
        if (passed) {
          markPhasePassed(platform, phaseIdx);
          resultsEl.innerHTML = `
            <span class="quiz-score-emoji">\u{1F389}</span>
            <div class="quiz-score-value" style="color:#3ddc84">${pct}%</div>
            <div class="quiz-score-label">\u2705 \u00A1Has superado la fase! Siguiente fase desbloqueada.</div>
            <button class="phase-next-btn" data-platform="${platform}" data-phase="${phaseIdx + 1}">\u{1F680} Ir a la siguiente fase</button>`;
        } else {
          resultsEl.innerHTML = `
            <span class="quiz-score-emoji">\u{1F504}</span>
            <div class="quiz-score-value" style="color:#f07178">${pct}%</div>
            <div class="quiz-score-label">Necesitas al menos ${Math.round(threshold * 100)}% para superar la fase. Tienes ${correct}/${blocksTotal}.</div>`;
        }
        btn.hidden = true;
        const retryBtn = section.querySelector('.quiz-retry-btn');
        if (retryBtn) retryBtn.hidden = !passed ? false : true;
      }

      if (passed) {
        setTimeout(() => renderProgram(), 500);
      }
    });
  });

  $$('.phase-next-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigateTo(btn.dataset.platform, 'program');
    });
  });

  $$('.quiz-retry-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const quizId = btn.dataset.quiz;
      const section = document.getElementById(quizId);
      $$('.quiz-option', section).forEach(o => o.classList.remove('selected', 'correct', 'incorrect', 'locked'));
      $$('.quiz-explanation', section).forEach(e => { e.hidden = true; });
      const resultsEl = document.getElementById(`results-${quizId}`);
      if (resultsEl) resultsEl.hidden = true;
      btn.hidden = true;
      const submitBtn = section.querySelector('.phase-quiz-submit-btn');
      if (submitBtn) submitBtn.hidden = false;
    });
  });
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

  dom.platformTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      navigateTo(tab.dataset.platform, 'program');
    });
  });

  if (dom.searchInput) {
    dom.searchInput.addEventListener('input', e => onSearch(e.target.value));
  }

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