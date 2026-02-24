// ========================================
// NoteVault — Explore Page
// ========================================

import { store } from '../store.js';
import { SUBJECTS, CLASSES, TOPICS } from '../constants.js';
import { renderNoteCard } from './home.js';
import { attachTiltToCards, applyStagger, icons } from '../utils.js';
import { navigate, renderBottomNav, attachNavListeners } from '../app.js';

let currentFilters = {
  subject: '',
  classLevel: '',
  topic: '',
  search: '',
  sort: 'recent'
};

export function setExploreFilter(key, value) {
  currentFilters[key] = value;
}

export async function renderExplore() {
  const notes = await store.getNotes(currentFilters);

  return `
    <div class="page-content page-enter">
      <div class="container">
        <!-- Header & Search -->
        <div style="margin-bottom: var(--space-8);">
          <h1 class="section-title" style="font-size: var(--fs-4xl); margin-bottom: var(--space-6);">
            Explore <span class="text-gradient">Knowledge</span>
          </h1>
          
          <div class="search-container">
            <span class="search-icon">${icons.search}</span>
            <input type="text" class="search-input" id="explore-search" placeholder="Search by title, topic, or keywords..." value="${currentFilters.search}">
          </div>
        </div>

        <!-- Filters -->
        <div class="filters-row">
          <div class="filter-group">
            <label class="filter-label">Subject</label>
            <select class="filter-select" id="filter-subject">
              <option value="">All Subjects</option>
              ${SUBJECTS.map(s => `<option value="${s.id}" ${currentFilters.subject === s.id ? 'selected' : ''}>${s.icon} ${s.name}</option>`).join('')}
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Class</label>
            <select class="filter-select" id="filter-class">
              <option value="">All Classes</option>
              ${CLASSES.map(c => `<option value="${c.id}" ${currentFilters.classLevel === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Topic</label>
            <select class="filter-select" id="filter-topic" ${!currentFilters.subject ? 'disabled' : ''}>
              <option value="">All Topics</option>
              ${currentFilters.subject ? (TOPICS[currentFilters.subject] || []).map(t => `<option value="${t}" ${currentFilters.topic === t ? 'selected' : ''}>${t}</option>`).join('') : ''}
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Sort By</label>
            <select class="filter-select" id="filter-sort">
              <option value="recent" ${currentFilters.sort === 'recent' ? 'selected' : ''}>Most Recent</option>
              <option value="likes" ${currentFilters.sort === 'likes' ? 'selected' : ''}>Most Liked</option>
              <option value="views" ${currentFilters.sort === 'views' ? 'selected' : ''}>Most Viewed</option>
            </select>
          </div>
        </div>

        <!-- Results -->
        <div class="results-info" style="margin-bottom: var(--space-6); color: var(--text-tertiary); font-size: var(--fs-sm);">
          Showing ${notes.length} notes
          ${Object.values(currentFilters).some(v => v && v !== 'recent') ? '<button class="btn-text" id="clear-filters" style="margin-left: var(--space-4);">Clear All</button>' : ''}
        </div>

        <div class="notes-grid" id="explore-results">
          ${notes.length > 0 ? notes.map((note, i) => renderNoteCard(note, i)).join('') : `
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <div class="empty-state-title">No notes found</div>
            <div class="empty-state-text">Try adjusting your filters or search query to find what you're looking for.</div>
          </div>
        `}
        </div>
      </div>
    </div>
  `;
}

export function initExplore() {
  // Search
  const searchInput = document.getElementById('explore-search');
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        currentFilters.search = e.target.value;
        refreshExplore();
      }, 500);
    });
  }

  // Select Filters
  document.getElementById('filter-subject')?.addEventListener('change', (e) => {
    currentFilters.subject = e.target.value;
    currentFilters.topic = ''; // Reset topic when subject changes
    refreshExplore();
  });

  document.getElementById('filter-class')?.addEventListener('change', (e) => {
    currentFilters.classLevel = e.target.value;
    refreshExplore();
  });

  document.getElementById('filter-topic')?.addEventListener('change', (e) => {
    currentFilters.topic = e.target.value;
    refreshExplore();
  });

  document.getElementById('filter-sort')?.addEventListener('change', (e) => {
    currentFilters.sort = e.target.value;
    refreshExplore();
  });

  document.getElementById('clear-filters')?.addEventListener('click', () => {
    currentFilters = { subject: '', classLevel: '', topic: '', search: '', sort: 'recent' };
    refreshExplore();
  });

  // Note Details
  document.querySelectorAll('.note-card[data-note-id]').forEach(card => {
    card.addEventListener('click', () => {
      navigate(`#/note/${card.dataset.noteId}`);
    });
  });

  attachTiltToCards('.note-card');
  applyStagger('.note-card');
}

async function refreshExplore() {
  const app = document.getElementById('app');
  const nav = document.querySelector('.bottom-nav');
  const navHTML = nav ? nav.outerHTML : '';

  // Show partial loading
  const resultsContainer = document.getElementById('explore-results');
  if (resultsContainer) resultsContainer.style.opacity = '0.5';

  app.innerHTML = (await renderExplore()) + navHTML;
  initExplore();

  // Re-attach nav listeners
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const route = item.dataset.route;
      if (route) navigate(route);
    });
  });
}
