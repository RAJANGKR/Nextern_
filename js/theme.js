/**
 * theme.js — Nextern Global Dark Mode Manager
 * Include this as the FIRST script in every page <head> to prevent flash.
 */
(function () {
    const THEME_KEY = 'nextern_theme';

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        // Update toggle button icon if present
        const btn = document.getElementById('themeToggleBtn');
        if (btn) {
            btn.innerHTML = theme === 'dark'
                ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
                : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
        }
    }

    // Apply immediately on load (before DOM paint) to prevent flash
    const saved = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(saved);

    // Expose globally
    window.toggleTheme = function () {
        const current = localStorage.getItem(THEME_KEY) || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
    };

    window.applyTheme = applyTheme;

    // Re-apply after DOM loads to update button icon
    document.addEventListener('DOMContentLoaded', function () {
        applyTheme(localStorage.getItem(THEME_KEY) || 'light');
    });
})();
