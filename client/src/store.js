// ========================================
// NoteVault — API-backed Store
// ========================================

import { BADGES } from './constants.js';

const API_BASE = 'http://localhost:5000/api';
const STORAGE_KEYS = {
    token: 'notevault_token',
    user: 'notevault_user'
};

class Store {
    constructor() {
        this.token = localStorage.getItem(STORAGE_KEYS.token);
        this.user = JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || 'null');
    }

    // --- Helpers ---
    async _fetch(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const resp = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || 'Request failed');
            return data;
        } catch (err) {
            console.error(`API Error (${endpoint}):`, err);
            throw err;
        }
    }

    // --- Auth ---
    async signup(name, email, password) {
        const username = '@' + name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        const avatarGradient = this._getRandomGradient();

        const data = await this._fetch('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, username, avatarGradient })
        });

        if (data.success) {
            this._setSession(data.token, data.user);
        }
        return data;
    }

    async login(email, password) {
        const data = await this._fetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (data.success) {
            this._setSession(data.token, data.user);
        }
        return data;
    }

    _setSession(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem(STORAGE_KEYS.token, token);
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem(STORAGE_KEYS.token);
        localStorage.removeItem(STORAGE_KEYS.user);
    }

    isLoggedIn() {
        return !!this.token && !!this.user;
    }

    getCurrentUserId() {
        return this.user?.id || '';
    }

    getCurrentUser() {
        return this.user;
    }

    // --- Notes ---
    async getNotes(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return await this._fetch(`/notes?${params}`);
    }

    async getNote(id) {
        return await this._fetch(`/notes/${id}`);
    }

    async addNote(noteData) {
        // Note: for PDF we use FormData
        const formData = new FormData();
        Object.keys(noteData).forEach(key => {
            if (noteData[key] !== null && noteData[key] !== undefined) {
                formData.append(key, noteData[key]);
            }
        });

        const headers = {};
        if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

        const resp = await fetch(`${API_BASE}/notes`, {
            method: 'POST',
            headers,
            body: formData
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'Failed to publish note');

        // Check badges after adding a note (on frontend for immediate feedback)
        // In a real app, badges might be awarded by the backend
        return data;
    }

    async likeNote(noteId) {
        return await this._fetch(`/notes/${noteId}/like`, { method: 'POST' });
    }

    // --- Users ---
    async getUser(id) {
        return await this._fetch(`/users/${id}`);
    }

    async toggleFollow(targetUserId) {
        return await this._fetch(`/users/${targetUserId}/follow`, { method: 'POST' });
    }

    async getGlobalStats() {
        return await this._fetch('/stats');
    }

    // --- Badges ---
    async getUserBadges(userId) {
        const user = await this.getUser(userId);
        return BADGES.map(badge => ({
            ...badge,
            earned: user.badges.includes(badge.id)
        }));
    }

    _getRandomGradient() {
        const gradients = [
            'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            'linear-gradient(135deg, #ec4899, #f97316)',
            'linear-gradient(135deg, #06b6d4, #3b82f6)',
            'linear-gradient(135deg, #3b82f6, #10b981)'
        ];
        return gradients[Math.floor(Math.random() * gradients.length)];
    }
}

export const store = new Store();
