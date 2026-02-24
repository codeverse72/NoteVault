// ========================================
// NoteVault — Note Detail (Modal)
// ========================================

import { store } from '../store.js';
import { SUBJECTS } from '../constants.js';
import { timeAgo, getInitial, icons, showToast } from '../utils.js';
import { navigate } from '../app.js';

const API_SERVER = 'http://localhost:5000';

export async function openNoteDetail(noteId) {
  // Show partial loading overlay if possible, or just wait for data
  let note;
  try {
    note = await store.getNote(noteId);
  } catch (err) {
    showToast('Could not load note details', 'info');
    return;
  }

  const subject = SUBJECTS.find(s => s.id === note.subject);
  const isLiked = note.likedBy.includes(store.getCurrentUserId());
  const isOwnNote = note.user_id === store.getCurrentUserId();
  const isFollowing = !isOwnNote && note.likedBy.includes(store.getCurrentUserId()); // This is just a placeholder logic, store handles real follow

  // Get real follow status
  let nowFollowing = false;
  if (!isOwnNote) {
    try {
      const authorData = await store.getUser(note.user_id);
      nowFollowing = authorData.followers.includes(store.getCurrentUserId());
    } catch (e) { }
  }

  const hasPdf = !!note.pdfPath;

  // Remove existing modal
  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" id="modal-close-btn">${icons.close}</button>

      <!-- Header -->
      <div class="modal-header">
        <div style="display: flex; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-4);">
          <span class="tag tag-subject">${subject ? subject.icon + ' ' + subject.name : note.subject}</span>
          <span class="tag tag-class">Class ${note.classLevel === 'ug' ? 'UG' : note.classLevel}</span>
          <span class="tag tag-topic">${note.topic}</span>
          ${hasPdf ? '<span class="tag tag-pdf">📎 PDF Attached</span>' : ''}
        </div>
        <h2 style="font-family: var(--font-display); font-size: var(--fs-2xl); font-weight: 800; line-height: 1.3;">
          ${note.title}
        </h2>
        <p style="color: var(--text-tertiary); font-size: var(--fs-sm); margin-top: var(--space-2);">
          ${timeAgo(note.createdAt)} · ${note.views} views
        </p>
      </div>

      <!-- Author Row -->
      <div class="modal-author-row">
        <div class="avatar avatar-md" style="background: ${note.authorGradient || 'var(--gradient-primary)'}; cursor: pointer;" id="modal-author-avatar">
          ${getInitial(note.authorName || '?')}
        </div>
        <div class="modal-author-info" style="cursor: pointer;" id="modal-author-info">
          <div class="modal-author-name">${note.authorName || 'Unknown'}</div>
          <div class="modal-author-username">${note.authorUsername || ''}</div>
        </div>
        ${!isOwnNote ? `
          <button class="btn btn-sm ${nowFollowing ? 'btn-secondary' : 'btn-primary'}" id="modal-follow-btn" data-user-id="${note.user_id}">
            ${nowFollowing ? '✓ Following' : '+ Follow'}
          </button>
        ` : ''}
      </div>

      <!-- Content -->
      <div class="modal-body">
        <div class="modal-note-content">${escapeHtml(note.content)}</div>
      </div>

      ${hasPdf ? `
      <!-- PDF Download -->
      <div class="pdf-download-section">
        <div class="pdf-download-card">
          <div class="pdf-download-icon">📄</div>
          <div class="pdf-download-info">
            <div class="pdf-download-name">${note.pdfName || 'attachment.pdf'}</div>
            <div class="pdf-download-hint">PDF attachment</div>
          </div>
          <button class="btn btn-primary btn-download" id="modal-download-btn">
            ${icons.download} Download
          </button>
        </div>
      </div>
      ` : ''}

      <!-- Actions -->
      <div class="modal-actions">
        <button class="like-btn ${isLiked ? 'liked' : ''}" id="modal-like-btn" data-note-id="${note.id}">
          ${isLiked ? icons.heartFilled : icons.heart}
          <span id="modal-like-count">${note.likes}</span> Like${note.likes !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // --- Event Listeners ---

  // Close
  document.getElementById('modal-close-btn').addEventListener('click', () => {
    modal.remove();
    if (window.location.hash.startsWith('#/note/')) {
      window.location.hash = '#/'; // Go back or home
    }
  });

  // Click outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      if (window.location.hash.startsWith('#/note/')) {
        window.location.hash = '#/';
      }
    }
  });

  // Escape key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', escHandler);
      if (window.location.hash.startsWith('#/note/')) {
        window.location.hash = '#/';
      }
    }
  };
  document.addEventListener('keydown', escHandler);

  // Like
  document.getElementById('modal-like-btn').addEventListener('click', async () => {
    try {
      const result = await store.likeNote(noteId);
      if (result.success) {
        const likeBtn = document.getElementById('modal-like-btn');
        const likeCount = document.getElementById('modal-like-count');

        // Toggle UI classes toggle
        likeBtn.classList.toggle('liked');
        const isNowLiked = likeBtn.classList.contains('liked');
        likeBtn.innerHTML = `
                    ${isNowLiked ? icons.heartFilled : icons.heart}
                    <span id="modal-like-count">${result.likes}</span> Like${result.likes !== 1 ? 's' : ''}
                `;
      }
    } catch (err) {
      showToast(err.message, 'info');
    }
  });

  // Follow
  const followBtn = document.getElementById('modal-follow-btn');
  if (followBtn) {
    followBtn.addEventListener('click', async () => {
      try {
        await store.toggleFollow(followBtn.dataset.userId);
        const isNowFollowing = followBtn.classList.contains('btn-primary'); // If it was primary, it's now secondary
        followBtn.className = `btn btn-sm ${isNowFollowing ? 'btn-secondary' : 'btn-primary'}`;
        followBtn.textContent = isNowFollowing ? '✓ Following' : '+ Follow';
        showToast(isNowFollowing ? 'Following user' : 'Unfollowed user', 'success');
      } catch (err) {
        showToast(err.message, 'info');
      }
    });
  }

  // Navigate to author profile
  const authorAvatar = document.getElementById('modal-author-avatar');
  const authorInfo = document.getElementById('modal-author-info');
  const goToProfile = () => {
    modal.remove();
    navigate(`#/profile/${note.user_id}`);
  };
  if (authorAvatar) authorAvatar.addEventListener('click', goToProfile);
  if (authorInfo) authorInfo.addEventListener('click', goToProfile);

  // PDF Download
  const downloadBtn = document.getElementById('modal-download-btn');
  if (downloadBtn && hasPdf) {
    downloadBtn.addEventListener('click', () => {
      const link = document.createElement('a');
      link.href = `${API_SERVER}${note.pdfPath}`;
      link.download = note.pdfName || 'attachment.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('📥 Download started!', 'success');
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
