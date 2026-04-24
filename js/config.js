/* ================================================================
   js/config.js — Central Configuration for Nextern Frontend
================================================================ */

// ── API Base URL (production-aware) ──
// In production this will point to Railway backend URL.
// Set window.NEXTERN_API_URL in a separate config or use env injection.
const isLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
window.API_BASE = isLocal
    ? `http://${window.location.hostname}:4000`
    : (window.NEXTERN_API_URL || 'https://nextern-production.up.railway.app');

// Also expose as CONFIG.API_BASE for compatibility
window.CONFIG = { API_BASE: window.API_BASE };

// ── Global helpers ──
window.getAuthToken = () => {
    const token = localStorage.getItem('nextern_token');
    return (token && token !== 'null' && token !== 'undefined') ? token : null;
};

window.getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${window.getAuthToken()}`
});

window.getUserId = () => {
    const userStr = localStorage.getItem('nextern_user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            return user._id || user.id || null;
        } catch (e) {
            return null;
        }
    }
    return null;
};

window.checkAuth = (loginRedirectPath = 'login.html') => {
    const token = window.getAuthToken();
    if (!token) {
        window.location.href = loginRedirectPath;
        return false;
    }
    return true;
};

window.clearLocalSession = () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('nextern_')) keysToRemove.push(key);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
};

window.syncLocalStorage = (user) => {
    if (!user) return;
    localStorage.setItem('nextern_user', JSON.stringify(user));
    localStorage.setItem('nextern_name', `${user.firstName} ${user.lastName}`);
    localStorage.setItem('nextern_email', user.email || '');
    localStorage.setItem('nextern_phone', user.phone || '');
    localStorage.setItem('nextern_college', user.college || '');
    localStorage.setItem('nextern_branch', user.branch || '');
    localStorage.setItem('nextern_year', user.year || '');
    localStorage.setItem('nextern_cgpa', user.cgpa || '');
    localStorage.setItem('nextern_bio', user.bio || '');
    localStorage.setItem('nextern_skills', JSON.stringify(user.skills || []));
    localStorage.setItem('nextern_target_company', (user.targetCompanies || []).join(', '));
};

// ── Logout handler ──
window.handleLogout = () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('nextern_')) localStorage.removeItem(key);
    });
    const inPagesFolder = window.location.pathname.includes('/pages/');
    window.location.href = inPagesFolder ? '../login.html' : 'login.html';
};

// ── Toast notification system ──
window.showToast = function (message, type = 'success', duration = 3500) {
    const existing = document.getElementById('nextern-toast');
    if (existing) existing.remove();

    const colors = {
        success: { bg: '#F0FDF4', border: '#86EFAC', text: '#16A34A' },
        error: { bg: '#FEF2F2', border: '#FCA5A5', text: '#DC2626' },
        info: { bg: '#EEF2FF', border: '#A5B4FC', text: '#6C63FF' },
        warning: { bg: '#FFF7ED', border: '#FCD34D', text: '#D97706' }
    };

    const icons = {
        success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
        error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };

    const c = colors[type] || colors.info;
    const toast = document.createElement('div');
    toast.id = 'nextern-toast';
    toast.style.cssText = `
        position:fixed; bottom:24px; right:24px;
        background:${c.bg}; border:1px solid ${c.border}; color:${c.text};
        padding:12px 18px; border-radius:10px;
        font-family:Inter,sans-serif; font-size:0.85rem; font-weight:500;
        display:flex; align-items:center; gap:8px;
        box-shadow:0 4px 16px rgba(0,0,0,0.12); z-index:9999;
        transform:translateY(80px); opacity:0;
        transition:all 0.3s ease; max-width:360px; cursor:pointer;
    `;
    toast.innerHTML = (icons[type] || '') + '<span>' + message + '</span>';
    toast.onclick = () => toast.remove();
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });

    setTimeout(() => {
        toast.style.transform = 'translateY(80px)';
        toast.style.opacity = '0';
        setTimeout(() => toast && toast.remove(), 300);
    }, duration);
};
