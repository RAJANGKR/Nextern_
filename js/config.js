/* ================================================================
   js/config.js — Central Configuration for Nextern Frontend
================================================================ */

// Dynamically determine API base
const isLocalIP = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
window.API_BASE = isLocalIP 
    ? `http://${window.location.hostname}:4000` 
    : 'http://localhost:4000'; // Default fallback

console.log('🌐 [Nextern Config] API_BASE set to:', window.API_BASE);

// Global helpers
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

/**
 * Global authentication guard.
 * Redirects to login if token is missing.
 * @param {string} loginRedirectPath - Path to login.html relative to current page.
 */
window.checkAuth = (loginRedirectPath = 'login.html') => {
    const token = window.getAuthToken();
    if (!token) {
        console.warn('🔑 [Auth Guard] No token found. Redirecting to login...');
        window.location.href = loginRedirectPath;
        return false;
    }
    return true;
};

/**
 * Wipes all Nextern-specific data from localStorage.
 */
window.clearLocalSession = () => {
    console.log('🧹 [Session] Clearing all local storage keys...');
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('nextern_')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
};

/**
 * Syncs a user object to localStorage keys.
 * @param {Object} user - User object from API response.
 */
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
