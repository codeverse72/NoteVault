// ========================================
// NoteVault — Add Note Page
// ========================================

import { store } from '../store.js';
import { SUBJECTS, CLASSES, TOPICS } from '../constants.js';
import { showToast, icons } from '../utils.js';
import { navigate } from '../app.js';

export function renderAddNote() {
  return `
    <div class="page-content page-enter">
      <div class="container">
        <div class="add-note-form">
          <div style="text-align: center; margin-bottom: var(--space-4);">
            <h1 class="section-title" style="font-size: var(--fs-4xl); margin-bottom: var(--space-2);">
              ✍️ Share a Note
            </h1>
            <p style="color: var(--text-secondary); font-size: var(--fs-sm);">
              Contribute to the community and earn badges for sharing knowledge
            </p>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="note-subject">Subject</label>
              <select class="form-select" id="note-subject">
                <option value="">Select Subject</option>
                ${SUBJECTS.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="note-class">Class / Level</label>
              <select class="form-select" id="note-class">
                <option value="">Select Class</option>
                ${CLASSES.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="note-topic">Topic</label>
            <select class="form-select" id="note-topic" disabled>
              <option value="">Select a Subject first</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="note-title">Title</label>
            <input type="text" class="form-input" id="note-title" placeholder="Give your note a descriptive title..." maxlength="120" />
          </div>

          <div class="form-group">
            <label class="form-label" for="note-content">Content</label>
            <textarea class="form-textarea" id="note-content" placeholder="Write your notes here... Include formulas, explanations, examples, and key concepts."></textarea>
          </div>

          <!-- PDF Upload -->
          <div class="form-group">
            <label class="form-label">📎 Attach PDF (optional, max 5MB)</label>
            <div class="pdf-upload-zone" id="pdf-drop-zone">
              <input type="file" id="pdf-input" accept=".pdf" style="display: none;" />
              <div class="pdf-upload-content" id="pdf-upload-content">
                <div class="pdf-upload-icon">${icons.upload}</div>
                <div class="pdf-upload-text">Drag & drop a PDF here or <span class="pdf-upload-link">browse files</span></div>
                <div class="pdf-upload-hint">PDF files only, up to 5MB</div>
              </div>
              <div class="pdf-file-info" id="pdf-file-info" style="display: none;">
                <div class="pdf-file-icon">📄</div>
                <div class="pdf-file-details">
                  <div class="pdf-file-name" id="pdf-file-name"></div>
                  <div class="pdf-file-size" id="pdf-file-size"></div>
                </div>
                <button class="pdf-remove-btn" id="pdf-remove-btn" type="button">${icons.close}</button>
              </div>
            </div>
          </div>

          <!-- Preview -->
          <div id="note-preview" style="display: none;">
            <h3 style="font-family: var(--font-display); font-weight: 700; margin-bottom: var(--space-4); color: var(--text-secondary);">
              📋 Preview
            </h3>
            <div class="note-card" style="opacity: 1; animation: none; cursor: default;">
              <div class="note-card-inner" id="preview-inner">
              </div>
            </div>
          </div>

          <div style="display: flex; gap: var(--space-4); justify-content: center; padding-top: var(--space-4);">
            <button class="btn btn-secondary" id="preview-btn" type="button">
              👁️ Preview
            </button>
            <button class="btn btn-primary" id="submit-btn" type="button">
              🚀 Publish Note
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initAddNote() {
  const subjectSelect = document.getElementById('note-subject');
  const topicSelect = document.getElementById('note-topic');
  const previewBtn = document.getElementById('preview-btn');
  const submitBtn = document.getElementById('submit-btn');
  const previewSection = document.getElementById('note-preview');
  const previewInner = document.getElementById('preview-inner');

  // PDF Upload state
  let pdfFile = null;

  const pdfInput = document.getElementById('pdf-input');
  const dropZone = document.getElementById('pdf-drop-zone');
  const uploadContent = document.getElementById('pdf-upload-content');
  const fileInfo = document.getElementById('pdf-file-info');
  const fileNameEl = document.getElementById('pdf-file-name');
  const fileSizeEl = document.getElementById('pdf-file-size');
  const removeBtn = document.getElementById('pdf-remove-btn');

  function handlePdfFile(file) {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showToast('Please upload a PDF file only', 'info');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File too large. Maximum size is 5MB', 'info');
      return;
    }

    pdfFile = file;
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = formatFileSize(file.size);
    uploadContent.style.display = 'none';
    fileInfo.style.display = 'flex';
    dropZone.classList.add('has-file');
  }

  // Click to browse
  uploadContent.addEventListener('click', () => pdfInput.click());

  // File input change
  pdfInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handlePdfFile(e.target.files[0]);
  });

  // Drag & drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handlePdfFile(e.dataTransfer.files[0]);
  });

  // Remove PDF
  removeBtn.addEventListener('click', () => {
    pdfFile = null;
    pdfInput.value = '';
    uploadContent.style.display = '';
    fileInfo.style.display = 'none';
    dropZone.classList.remove('has-file');
  });

  // Cascade: Subject → Topics
  subjectSelect.addEventListener('change', () => {
    const subjectId = subjectSelect.value;
    if (subjectId && TOPICS[subjectId]) {
      topicSelect.disabled = false;
      topicSelect.innerHTML = `
        <option value="">Select Topic</option>
        ${TOPICS[subjectId].map(t => `<option value="${t}">${t}</option>`).join('')}
      `;
    } else {
      topicSelect.disabled = true;
      topicSelect.innerHTML = '<option value="">Select a Subject first</option>';
    }
  });

  // Preview
  previewBtn.addEventListener('click', () => {
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;
    const subject = SUBJECTS.find(s => s.id === subjectSelect.value);
    const classLevel = document.getElementById('note-class').value;
    const topic = topicSelect.value;

    if (!title || !content) {
      showToast('Please fill in at least the title and content', 'info');
      return;
    }

    previewSection.style.display = 'block';
    previewInner.innerHTML = `
      <div class="note-card-tags" style="margin-bottom: var(--space-3);">
        ${subject ? `<span class="tag tag-subject">${subject.icon} ${subject.name}</span>` : ''}
        ${classLevel ? `<span class="tag tag-class">Class ${classLevel === 'ug' ? 'UG' : classLevel}</span>` : ''}
        ${topic ? `<span class="tag tag-topic">${topic}</span>` : ''}
        ${pdfFile ? `<span class="tag tag-pdf">📎 ${pdfFile.name}</span>` : ''}
      </div>
      <h3 class="note-card-title" style="margin-bottom: var(--space-3);">${title}</h3>
      <p style="color: var(--text-secondary); line-height: 1.7; white-space: pre-wrap; font-size: var(--fs-sm);">${content}</p>
    `;

    previewSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Submit
  submitBtn.addEventListener('click', async () => {
    const subject = subjectSelect.value;
    const classLevel = document.getElementById('note-class').value;
    const topic = topicSelect.value;
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();

    if (!subject || !classLevel || !topic || !title || !content) {
      showToast('Please fill in all fields before publishing', 'info');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Publishing...';

    try {
      await store.addNote({
        subject,
        classLevel,
        topic,
        title,
        content,
        pdf: pdfFile
      });

      showToast('🎉 Note published successfully!', 'success');
      setTimeout(() => navigate('#/'), 800);
    } catch (err) {
      showToast(err.message, 'info');
      submitBtn.disabled = false;
      submitBtn.textContent = '🚀 Publish Note';
    }
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
