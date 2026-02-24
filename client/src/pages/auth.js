// ========================================
// NoteVault — Auth (Login & Signup)
// ========================================

import { store } from '../store.js';
import { navigate } from '../app.js';
import { showToast } from '../utils.js';

export function renderLogin() {
  return `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
      </div>
      
      <div class="auth-card">
        <div class="auth-logo">🚀</div>
        <h1 class="auth-title">Welcome Back</h1>
        <p class="auth-subtitle">Log in to your NoteVault account</p>
        
        <form class="auth-form" id="login-form">
          <div class="form-group">
            <label class="form-label" for="login-email">Email Address</label>
            <input type="email" class="form-input" id="login-email" placeholder="name@email.com" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="login-password">Password</label>
            <input type="password" class="form-input" id="login-password" placeholder="••••••••" required />
          </div>
          <div class="auth-error" id="login-error"></div>
          <button type="submit" class="btn btn-primary auth-btn" id="login-submit">Log In</button>
        </form>
        
        <div class="auth-switch">
          Don't have an account? <a href="#/signup" class="auth-link">Sign Up</a>
        </div>

        <div class="auth-demo-hint">
          <span class="auth-demo-label">Demo access</span>
          <div class="auth-demo-info">demo@notevault.com / demo123</div>
        </div>
      </div>
    </div>
  `;
}

export function initLogin() {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const errorEl = document.getElementById('login-error');
  const submitBtn = document.getElementById('login-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
      const result = await store.login(email, password);
      if (result.success) {
        showToast(`Welcome back, ${result.user.name}!`, 'success');
        navigate('#/');
      }
    } catch (err) {
      errorEl.textContent = err.message || 'Invalid email or password';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log In';
    }
  });
}

export function renderSignup() {
  return `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
      </div>
      
      <div class="auth-card">
        <div class="auth-logo">✨</div>
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-subtitle">Join the professional note-sharing community</p>
        
        <form class="auth-form" id="signup-form">
          <div class="form-group">
            <label class="form-label" for="signup-name">Full Name</label>
            <input type="text" class="form-input" id="signup-name" placeholder="John Doe" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="signup-email">Email Address</label>
            <input type="email" class="form-input" id="signup-email" placeholder="name@email.com" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="signup-password">Password</label>
            <input type="password" class="form-input" id="signup-password" placeholder="Min. 6 characters" required minlength="6" />
          </div>
          <div class="auth-error" id="signup-error"></div>
          <button type="submit" class="btn btn-primary auth-btn" id="signup-submit">Sign Up</button>
        </form>
        
        <div class="auth-switch">
          Already have an account? <a href="#/login" class="auth-link">Log In</a>
        </div>
      </div>
    </div>
  `;
}

export function initSignup() {
  const form = document.getElementById('signup-form');
  const nameInput = document.getElementById('signup-name');
  const emailInput = document.getElementById('signup-email');
  const passwordInput = document.getElementById('signup-password');
  const errorEl = document.getElementById('signup-error');
  const submitBtn = document.getElementById('signup-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!name || !email || !password) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      const result = await store.signup(name, email, password);
      if (result.success) {
        showToast(`Account created! Welcome, ${name}!`, 'success');
        navigate('#/');
      }
    } catch (err) {
      errorEl.textContent = err.message || 'Signup failed. Please try again.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign Up';
    }
  });
}
