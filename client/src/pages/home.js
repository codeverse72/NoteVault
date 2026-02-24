// ========================================
// NoteVault — Home Page
// ========================================

import { store } from '../store.js';
import { SUBJECTS } from '../constants.js';
import { attachTiltToCards, applyStagger, timeAgo, getInitial, getSubjectColor, icons } from '../utils.js';
import { navigate } from '../app.js';

export async function renderHome() {
  const [notes, stats] = await Promise.all([
    store.getNotes({ limit: 8 }),
    store.getGlobalStats()
  ]);

  return `
    <div class="page-content page-enter">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-bg">
          <div class="orb orb-1"></div>
          <div class="orb orb-2"></div>
        </div>
        
        <div class="container hero-container">
          <div class="hero-content">
            <h1 class="hero-title">
              Share Knowledge, <br/>
              <span class="text-gradient">Earn Recognition.</span>
            </h1>
            <p class="hero-subtitle">
              The premium platform for students to share, discover, and organize notes. 
              Build your academic profile and earn community badges.
            </p>
            <div class="hero-actions">
              <button class="btn btn-primary btn-lg" id="hero-explore-btn">Explore Notes</button>
              <button class="btn btn-secondary btn-lg" id="hero-share-btn">Share My Notes</button>
            </div>
          </div>

          <!-- Floating 3D Cards -->
          <div class="hero-visual">
            <div class="hero-float-card card-1">
              <div class="float-card-inner">
                <div class="float-card-icon">📚</div>
                <div class="float-card-text">Calculus II</div>
              </div>
            </div>
            <div class="hero-float-card card-2">
              <div class="float-card-inner">
                <div class="float-card-icon">⚛️</div>
                <div class="float-card-text">Quantum Physics</div>
              </div>
            </div>
            <div class="hero-float-card card-3">
              <div class="float-card-inner">
                <div class="float-card-icon">💻</div>
                <div class="float-card-text">Data Structures</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Stats -->
      <section class="container" style="margin-top: -40px; position: relative; z-index: 10;">
        <div class="quick-stats">
          <div class="stat-item">
            <span class="stat-value">${stats.totalNotes || 0}</span>
            <span class="stat-label">Notes Shared</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">${stats.totalUsers || 0}</span>
            <span class="stat-label">Contributors</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">${stats.totalSubjects || 0}</span>
            <span class="stat-label">Subjects</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">${stats.totalLikes || 0}</span>
            <span class="stat-label">Recognitions</span>
          </div>
        </div>
      </section>

      <!-- Subjects Grid -->
      <section class="container" style="margin-top: var(--space-16);">
        <h2 class="section-title">Browse by Subject</h2>
        <div class="subjects-grid">
          ${SUBJECTS.map(s => `
            <div class="subject-card" data-subject="${s.id}">
              <div class="note-card-inner" style="padding: var(--space-6); text-align: center;">
                <div style="font-size: 2.5rem; margin-bottom: var(--space-4);">${s.icon}</div>
                <div style="font-family: var(--font-display); font-weight: 700; font-size: var(--fs-lg);">${s.name}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Trending Notes -->
      <section class="container" style="margin-top: var(--space-16); margin-bottom: var(--space-24);">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--space-8);">
          <h2 class="section-title" style="margin-bottom: 0;">Trending Notes</h2>
          <button class="btn-text" id="view-all-notes">View All ${icons.search}</button>
        </div>
        
        <div class="notes-grid">
          ${notes.length > 0 ? notes.map((note, i) => renderNoteCard(note, i)).join('') : '<p>No notes found.</p>'}
        </div>
      </section>
    </div>
  `;
}

export function renderNoteCard(note, index = 0) {
  const subject = SUBJECTS.find(s => s.id === note.subject);
  const hasPdf = !!note.pdfPath;
  const excerpt = note.content ? (note.content.length > 120 ? note.content.substring(0, 120) + '...' : note.content) : '';

  return `
    <div class="note-card perspective-container stagger-${(index % 8) + 1}" data-note-id="${note.id}">
      <div class="note-card-inner">
        <div class="note-card-header">
          <div class="tag" style="background: ${getSubjectColor(note.subject)}20; color: ${getSubjectColor(note.subject)}">
            ${subject ? subject.icon : ''} ${subject ? subject.name : note.subject}
          </div>
          <div class="note-card-stats">
            <span>${icons.eye} ${note.views}</span>
            <span>${icons.heartFilled} ${note.likes}</span>
          </div>
        </div>
        <h3 class="note-card-title">${note.title}</h3>
        <p class="note-card-excerpt">${excerpt}</p>
        <div style="margin-bottom: var(--space-2); display: flex; flex-wrap: wrap; gap: var(--space-1);">
          <span class="tag tag-topic">${note.topic}</span>
          ${hasPdf ? '<span class="tag tag-pdf">📎 PDF</span>' : ''}
        </div>
        <div class="note-card-footer">
          <div class="note-card-author">
            <div class="avatar avatar-sm" style="background: ${note.authorGradient || 'var(--gradient-primary)'}">
              ${getInitial(note.authorName || '?')}
            </div>
            <span>${note.authorUsername || 'unknown'}</span>
          </div>
          <span class="note-card-date">${timeAgo(note.createdAt)}</span>
        </div>
      </div>
    </div>
    `;
}

export function initHome() {
  // Buttons
  document.getElementById('hero-explore-btn')?.addEventListener('click', () => navigate('#/explore'));
  document.getElementById('hero-share-btn')?.addEventListener('click', () => navigate('#/add'));
  document.getElementById('view-all-notes')?.addEventListener('click', () => navigate('#/explore'));

  // Subject Filter
  document.querySelectorAll('.subject-card').forEach(card => {
    card.addEventListener('click', () => {
      const subject = card.dataset.subject;
      navigate(`#/explore?subject=${subject}`);
    });
  });

  // Note Details
  document.querySelectorAll('.note-card[data-note-id]').forEach(card => {
    card.addEventListener('click', () => {
      navigate(`#/note/${card.dataset.noteId}`);
    });
  });

  // Animate
  attachTiltToCards('.note-card');
  attachTiltToCards('.subject-card');
  applyStagger('.note-card');
}
