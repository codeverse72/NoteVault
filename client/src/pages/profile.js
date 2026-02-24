// ========================================
// NoteVault — Profile Page
// ========================================

import { store } from '../store.js';
import { getInitial, attachTiltToCards, applyStagger, icons } from '../utils.js';
import { renderNoteCard } from './home.js';
import { navigate, renderBottomNav, attachNavListeners } from '../app.js';

export async function renderProfile(userId) {
  const targetUserId = userId || store.getCurrentUserId();
  const user = await store.getUser(targetUserId);
  if (!user) return '<div class="container page-enter"><h2>User not found</h2></div>';

  const isOwnProfile = user.id === store.getCurrentUserId();
  const userNotes = await store.getNotes({ userId: user.id });
  const allBadges = await store.getUserBadges(user.id);
  const earnedBadges = allBadges.filter(b => b.earned);
  const isFollowing = !isOwnProfile && user.followers.includes(store.getCurrentUserId());

  return `
    <div class="page-content page-enter">
      <div class="container">
        <!-- Profile Header -->
        <div class="profile-header">
          <div class="avatar-ring">
            <div class="avatar avatar-xl" style="background: ${user.avatarGradient};">
              ${getInitial(user.name)}
            </div>
          </div>
          <div>
            <h1 class="profile-name">${user.name}</h1>
            <p class="profile-username">${user.username}</p>
          </div>
          <p class="profile-bio">${user.bio}</p>
          ${!isOwnProfile ? `
            <button class="btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}" id="follow-btn" data-user-id="${user.id}">
              ${isFollowing ? '✓ Following' : '+ Follow'}
            </button>
          ` : `
            <button class="btn btn-secondary btn-logout" id="logout-btn">
              ${icons.logout} Log Out
            </button>
          `}
        </div>

        <!-- Stats -->
        <div class="stats-row" style="margin-bottom: var(--space-10);">
          <div class="stat-card">
            <div class="stat-card-value">${userNotes.length}</div>
            <div class="stat-card-label">Notes</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-value">${user.followers.length}</div>
            <div class="stat-card-label">Followers</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-value">${user.following.length}</div>
            <div class="stat-card-label">Following</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-value">${earnedBadges.length}</div>
            <div class="stat-card-label">Badges</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs" id="profile-tabs">
          <button class="tab-btn active" data-tab="badges">🏅 Badges</button>
          <button class="tab-btn" data-tab="notes">📝 Notes</button>
        </div>

        <!-- Tab Content -->
        <div id="tab-content">
          ${renderBadgesTab(allBadges)}
        </div>
      </div>
    </div>
  `;
}

function renderBadgesTab(allBadges) {
  return `
    <div class="badges-grid" id="badges-tab">
      ${allBadges.map((badge, i) => `
        <div class="badge-card ${badge.earned ? 'earned' : 'locked'} stagger-${(i % 8) + 1}">
          <div class="badge-icon-large">${badge.icon}</div>
          <div class="badge-name">${badge.name}</div>
          <div class="badge-desc">${badge.desc}</div>
        </div>
      `).join('')}
    </div>
  `;
}

async function renderNotesTab(userId) {
  const notes = await store.getNotes({ userId });
  if (notes.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-title">No notes yet</div>
        <div class="empty-state-text">Start sharing your knowledge with the community!</div>
      </div>
    `;
  }
  return `
    <div class="notes-grid">
      ${notes.map((note, i) => renderNoteCard(note, i)).join('')}
    </div>
  `;
}

export function initProfile(userId) {
  const targetUserId = userId || store.getCurrentUserId();

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      navigate('#/logout');
    });
  }

  // Follow button
  const followBtn = document.getElementById('follow-btn');
  if (followBtn) {
    followBtn.addEventListener('click', async () => {
      await store.toggleFollow(followBtn.dataset.userId);
      // Re-render page properly
      const app = document.getElementById('app');
      app.innerHTML = (await renderProfile(targetUserId)) + renderBottomNav('#/profile');
      initProfile(targetUserId);
      attachNavListeners();
    });
  }

  // Tab switching
  document.querySelectorAll('#profile-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('#profile-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tab = btn.dataset.tab;
      const tabContent = document.getElementById('tab-content');

      if (tab === 'badges') {
        const allBadges = await store.getUserBadges(targetUserId);
        tabContent.innerHTML = renderBadgesTab(allBadges);
        applyStagger('.badge-card');
      } else if (tab === 'notes') {
        tabContent.innerHTML = await renderNotesTab(targetUserId);
        attachTiltToCards('.note-card');
        applyStagger('.note-card');
        // Note card clicks
        document.querySelectorAll('.note-card[data-note-id]').forEach(card => {
          card.addEventListener('click', () => {
            navigate(`#/note/${card.dataset.noteId}`);
          });
        });
      }
    });
  });

  applyStagger('.badge-card');
  attachTiltToCards('.stat-card');
}
