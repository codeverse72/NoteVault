// ========================================
// NoteVault — Main Application Router
// ========================================

import { renderHome, initHome } from './pages/home.js';
import { renderExplore, initExplore, setExploreFilter } from './pages/explore.js';
import { renderAddNote, initAddNote } from './pages/addNote.js';
import { renderProfile, initProfile } from './pages/profile.js';
import { openNoteDetail } from './pages/noteDetail.js';
import { renderLogin, initLogin, renderSignup, initSignup } from './pages/auth.js';
import { store } from './store.js';
import { icons } from './utils.js';

// --- Navigation ---
export function navigate(hash) {
    window.location.hash = hash;
}

// --- Bottom Navigation ---
function renderBottomNav(activeRoute) {
    const routes = [
        { hash: '#/', icon: icons.home, label: 'Home' },
        { hash: '#/explore', icon: icons.explore, label: 'Explore' },
        { hash: '#/add', icon: icons.add, label: 'Add', isAdd: true },
        { hash: '#/profile', icon: icons.profile, label: 'Profile' }
    ];

    return `
    <nav class="bottom-nav">
      <ul class="nav-list">
        ${routes.map(r => {
        if (r.isAdd) {
            return `
              <li class="nav-item nav-item-add" data-route="${r.hash}">
                <div class="add-btn-bg">${r.icon}</div>
              </li>
            `;
        }
        const isActive = activeRoute === r.hash ||
            (r.hash === '#/' && (activeRoute === '' || activeRoute === '#')) ||
            (r.hash === '#/profile' && activeRoute.startsWith('#/profile'));
        return `
            <li class="nav-item ${isActive ? 'active' : ''}" data-route="${r.hash}">
              ${r.icon}
              <span>${r.label}</span>
            </li>
          `;
    }).join('')}
      </ul>
    </nav>
  `;
}

// --- Router ---
function getRoute() {
    const hash = window.location.hash || '#/';
    return hash;
}

function parseRoute(hash) {
    // Auth routes (no login required)
    if (hash === '#/login') return { page: 'login', params: {}, authRequired: false };
    if (hash === '#/signup') return { page: 'signup', params: {}, authRequired: false };

    // #/note/:id
    if (hash.startsWith('#/note/')) {
        return { page: 'noteDetail', params: { id: hash.replace('#/note/', '') }, authRequired: true };
    }
    // #/profile/:id
    if (hash.startsWith('#/profile/')) {
        return { page: 'profile', params: { id: hash.replace('#/profile/', '') }, authRequired: true };
    }
    // #/explore?subject=xxx
    if (hash.startsWith('#/explore')) {
        const params = {};
        const qs = hash.split('?')[1];
        if (qs) {
            qs.split('&').forEach(p => {
                const [k, v] = p.split('=');
                params[k] = decodeURIComponent(v);
            });
        }
        return { page: 'explore', params, authRequired: true };
    }

    switch (hash) {
        case '#/': case '#': case '': return { page: 'home', params: {}, authRequired: true };
        case '#/add': return { page: 'add', params: {}, authRequired: true };
        case '#/profile': return { page: 'profile', params: {}, authRequired: true };
        case '#/logout': return { page: 'logout', params: {}, authRequired: false };
        default: return { page: 'home', params: {}, authRequired: true };
    }
}

async function renderPage() {
    const hash = getRoute();
    const route = parseRoute(hash);
    const app = document.getElementById('app');

    // Handle logout
    if (route.page === 'logout') {
        store.logout();
        navigate('#/login');
        return;
    }

    // Auth guard: redirect to login if not logged in
    if (route.authRequired && !store.isLoggedIn()) {
        navigate('#/login');
        return;
    }

    // If logged in and trying to access auth pages, redirect to home
    if ((route.page === 'login' || route.page === 'signup') && store.isLoggedIn()) {
        navigate('#/');
        return;
    }

    // If note detail, open as modal over current page
    if (route.page === 'noteDetail') {
        // Make sure there's a page behind the modal
        if (!document.querySelector('.page-content')) {
            app.innerHTML = (await renderHome()) + renderBottomNav('#/');
            initHome();
            attachNavListeners();
        }
        openNoteDetail(route.params.id);
        return;
    }

    let pageHTML = '';
    let activeNav = hash.split('?')[0];
    let showNav = true;

    // Show loading state
    if (route.page !== 'login' && route.page !== 'signup') {
        app.innerHTML = '<div class="loading-full"><div class="loading-spinner"></div></div>' + (showNav ? renderBottomNav(activeNav) : '');
    }

    try {
        switch (route.page) {
            case 'login':
                pageHTML = renderLogin();
                showNav = false;
                break;
            case 'signup':
                pageHTML = renderSignup();
                showNav = false;
                break;
            case 'home':
                pageHTML = await renderHome();
                break;
            case 'explore':
                if (route.params.subject) setExploreFilter('subject', route.params.subject);
                pageHTML = await renderExplore();
                break;
            case 'add':
                pageHTML = renderAddNote();
                break;
            case 'profile':
                pageHTML = await renderProfile(route.params.id);
                activeNav = '#/profile';
                break;
            default:
                pageHTML = await renderHome();
        }

        app.innerHTML = pageHTML + (showNav ? renderBottomNav(activeNav) : '');

        // Init page-specific behavior
        switch (route.page) {
            case 'login': initLogin(); break;
            case 'signup': initSignup(); break;
            case 'home': initHome(); break;
            case 'explore': initExplore(); break;
            case 'add': initAddNote(); break;
            case 'profile': initProfile(route.params.id); break;
        }

        if (showNav) attachNavListeners();
    } catch (err) {
        console.error('Page Render Error:', err);
        app.innerHTML = `
            <div class="container" style="padding: 100px 20px; text-align: center;">
                <h1 style="font-size: 3rem; margin-bottom: 20px;">😵</h1>
                <h2>Oops! Something went wrong</h2>
                <p style="color: var(--text-tertiary); margin: 20px 0;">${err.message}</p>
                <button class="btn btn-primary" onclick="window.location.reload()">Retry</button>
            </div>
        ` + (showNav ? renderBottomNav(activeNav) : '');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function attachNavListeners() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const targetRoute = item.dataset.route;
            if (targetRoute) navigate(targetRoute);
        });
    });
}

// Export for use by other pages that need to re-render nav
export { renderBottomNav, attachNavListeners };

// --- Init ---
function init() {
    window.addEventListener('hashchange', renderPage);
    renderPage();
}

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
