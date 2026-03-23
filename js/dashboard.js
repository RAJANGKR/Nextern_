/* ================================================================
   NEXTERN — dashboard.js

   TEACH: This file handles all the interactivity on the dashboard.
   It's split into small focused functions — one per feature.

   Functions in this file:
   1. setGreeting()         — "Good morning/afternoon/evening, Name"
   2. animateReadinessRing()— SVG circle progress animation
   3. animateBars()         — mini progress bars
   4. toggleNotifications() — show/hide dropdown
   5. clearNotifications()  — mark all read
   6. toggleSidebar()       — mobile drawer open/close
   7. handleLogout()        — clear session, redirect to login
   8. init()                — runs everything on page load
================================================================ */


/* ----------------------------------------------------------------
   1. GREETING — changes based on time of day
   
   TEACH: new Date() gives us the current date/time.
   .getHours() returns 0–23. We use that to pick the greeting.
---------------------------------------------------------------- */
function setGreeting() {
    const now = new Date();
    const hour = now.getHours();
    const greetingEl = document.getElementById('topbarGreeting');
    const dateEl = document.getElementById('topbarDate');

    // Pick greeting based on hour
    let timeGreeting = 'Good evening';
    if (hour >= 5 && hour < 12) timeGreeting = 'Good morning';
    if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';

    /*
      TEACH: In the backend phase, we'll fetch the real user name from:
      GET /api/user/me  →  { name: "Riya Sharma", ... }
      For now we read from localStorage or use a default.
    */
    const userName = localStorage.getItem('nextern_name') || 'there';
    const firstName = userName.split(' ')[0]; // "Riya Sharma" → "Riya"

    if (greetingEl) greetingEl.textContent = `${timeGreeting}, ${firstName} 👋`;

    // Format date: "Monday, 9 March 2026"
    if (dateEl) {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('en-IN', options);
    }
}


/* ----------------------------------------------------------------
   2. READINESS RING ANIMATION
   
   TEACH: SVG circle trick —
   - stroke-dasharray  = full circumference of the circle
   - stroke-dashoffset = how much of the dash to "offset" (hide)
   
   Setting dashoffset = circumference → circle is fully hidden
   Setting dashoffset = 0             → circle is fully filled
   
   For a score of 68%:
   offset = circumference - (68/100 * circumference)
          = 339 - (0.68 * 339)
          = 339 - 230.5
          = 108.5
   
   We animate dashoffset from 339 (empty) to 108.5 (68% filled)
   using requestAnimationFrame.
---------------------------------------------------------------- */
function animateReadinessRing() {
    const ring = document.getElementById('readinessRing');
    const scoreEl = document.getElementById('readinessScore');
    const statusEl = document.getElementById('readinessStatus');
    if (!ring || !scoreEl) return;

    const TARGET_SCORE = 68;           // TODO: fetch from API later
    const CIRCUMFERENCE = 339;          // 2 * π * 54 ≈ 339
    const DURATION = 1400;         // ms

    // Status message based on score
    const statusMessages = {
        low: 'Just getting started 🌱',
        mid: 'Getting stronger 💪',
        good: 'Looking good! 🚀',
        great: 'Almost there! ⭐',
        top: 'Placement ready! 🎉',
    };

    function getStatus(score) {
        if (score < 30) return statusMessages.low;
        if (score < 50) return statusMessages.mid;
        if (score < 70) return statusMessages.good;
        if (score < 90) return statusMessages.great;
        return statusMessages.top;
    }

    // Colour changes with score — green at high, amber at mid, red at low
    function getRingColor(score) {
        if (score >= 70) return '#22C55E';
        if (score >= 40) return '#6C63FF';
        return '#F59E0B';
    }

    let startTime = null;

    function tick(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / DURATION, 1);

        // Ease out cubic — starts fast, slows down
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentScore = Math.floor(eased * TARGET_SCORE);
        const offset = CIRCUMFERENCE - (currentScore / 100) * CIRCUMFERENCE;

        // Update ring
        ring.style.strokeDashoffset = offset;
        ring.style.stroke = getRingColor(currentScore);

        // Update score number
        scoreEl.textContent = currentScore;

        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            // Snap to final values
            scoreEl.textContent = TARGET_SCORE;
            ring.style.strokeDashoffset = CIRCUMFERENCE - (TARGET_SCORE / 100) * CIRCUMFERENCE;
            if (statusEl) statusEl.textContent = getStatus(TARGET_SCORE);
        }
    }

    // Small delay before starting so page loads first
    setTimeout(() => requestAnimationFrame(tick), 400);
}


/* ----------------------------------------------------------------
   3. ANIMATE PROGRESS BARS
   
   TEACH: We use data-width="60" on the element.
   JS reads that value and sets element.style.width = "60%"
   CSS transition: width 1s ease  →  animates smoothly.
   
   This pattern (data attributes + CSS transitions) is
   much cleaner than animating width in JS directly.
---------------------------------------------------------------- */
function animateBars() {
    // Small delay so bars animate after the ring
    setTimeout(() => {
        document.querySelectorAll('[data-width]').forEach(bar => {
            bar.style.width = bar.dataset.width + '%';
        });
    }, 600);
}


/* ----------------------------------------------------------------
   4. NOTIFICATION DROPDOWN
   
   TEACH: We toggle a CSS class (.open) on the dropdown.
   The CSS already handles show/hide:
     .notif-dropdown        { display: none }
     .notif-dropdown.open   { display: block }
   
   We also close it when clicking outside — standard UX pattern.
---------------------------------------------------------------- */
function toggleNotifications() {
    const dropdown = document.getElementById('notifDropdown');
    if (!dropdown) return;
    dropdown.classList.toggle('open');
}

// Close dropdown when clicking outside of it
document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('notifDropdown');
    const bell = document.querySelector('.notif-btn');
    if (!dropdown || !bell) return;

    // If click was NOT inside the dropdown or on the bell, close it
    if (!dropdown.contains(e.target) && !bell.contains(e.target)) {
        dropdown.classList.remove('open');
    }
});

function clearNotifications() {
    // Remove .unread class from all notification items
    document.querySelectorAll('.notif-item.unread').forEach(item => {
        item.classList.remove('unread');
    });
    // Hide the red dot
    const dot = document.querySelector('.notif-dot');
    if (dot) dot.style.display = 'none';
}


/* ----------------------------------------------------------------
   5. MOBILE SIDEBAR TOGGLE
   
   TEACH: On mobile, the sidebar has:
     transform: translateX(-100%)   →  hidden off screen (left)
   
   When we add .open:
     transform: translateX(0)       →  slides into view
   
   CSS transition: transform 0.25s ease  →  smooth slide
   
   We also add an overlay behind the sidebar so clicking outside closes it.
---------------------------------------------------------------- */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    sidebar.classList.toggle('open');

    // Create/remove overlay
    let overlay = document.getElementById('sidebarOverlay');
    if (sidebar.classList.contains('open')) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sidebarOverlay';
            overlay.style.cssText = `
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.4);
        z-index: 199;
      `;
            overlay.onclick = toggleSidebar; // click overlay to close
            document.body.appendChild(overlay);
        }
    } else {
        if (overlay) overlay.remove();
    }
}


/* ----------------------------------------------------------------
   6. LOGOUT
   
   TEACH: On logout we:
   1. Clear any stored tokens / user data from localStorage
   2. Redirect to login page
   
   In the backend phase this will also call:
   POST /api/auth/logout  (to invalidate the session on server)
---------------------------------------------------------------- */
function handleLogout() {
    localStorage.removeItem('nextern_token');
    localStorage.removeItem('nextern_name');
    window.location.href = '../login.html';
}


/* ----------------------------------------------------------------
   7. CHANGE TARGET COMPANY
   Placeholder — will open a modal in a future update.
---------------------------------------------------------------- */
function changeTarget() {
    alert('Target company selector coming soon!\nFor now, update it from your profile.');
}


/* ----------------------------------------------------------------
   8. SET USER INFO FROM STORAGE
   
   TEACH: After login/register, we'll store the user's name:
   localStorage.setItem('nextern_name', 'Riya Sharma')
   
   Dashboard reads it on load and fills in the name fields.
   Later this will be replaced with a real API call.
---------------------------------------------------------------- */
function setUserInfo() {
    const name = localStorage.getItem('nextern_name') || 'Riya Sharma';
    const branch = localStorage.getItem('nextern_branch') || 'CSE';
    const year = localStorage.getItem('nextern_year') || '3rd Year';

    const initial = name.charAt(0).toUpperCase();

    // Sidebar
    const nameEl = document.getElementById('userName');
    const metaEl = document.getElementById('userMeta');
    const avatarEl = document.getElementById('userAvatar');
    if (nameEl) nameEl.textContent = name;
    if (metaEl) metaEl.textContent = `${branch} · ${year}`;
    if (avatarEl) avatarEl.textContent = initial;

    // Topbar avatar
    const topAvatar = document.getElementById('topbarAvatar');
    if (topAvatar) topAvatar.textContent = initial;
}


/* ----------------------------------------------------------------
   INIT
---------------------------------------------------------------- */
function init() {
    setGreeting();
    setUserInfo();
    animateReadinessRing();
    animateBars();
}

init();