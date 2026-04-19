/**
 * sidebar.js - Universal Navigation Component for Nextern
 * Injects a consistent, professional sidebar into any page with #sidebar-mount
 */

(function () {
    // 1. CONFIG & DATA
    const name = localStorage.getItem('nextern_name') || 'Student';
    const userStr = localStorage.getItem('nextern_user');
    let branch = 'Student';
    let year = '';
    let isAdmin = false;

    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            branch = user.branch || 'CSE';
            year = user.year || '3rd Year';
            isAdmin = user.role === 'admin';
        } catch (e) { }
    }

    const driveCount = localStorage.getItem('nextern_drive_count') || '0';
    let readiness = parseInt(localStorage.getItem('nextern_readiness') || '0', 10);

    // Async fetch live data after sidebar mounts
    async function refreshLiveData() {
        const token = localStorage.getItem('nextern_token');
        if (!token) return;
        const API_BASE = 'http://localhost:4000';
        try {
            // Drive badge count
            const dr = await fetch(`${API_BASE}/api/drives`, { headers: { Authorization: `Bearer ${token}` } });
            const dd = await dr.json();
            if (dd.success && dd.drives) {
                localStorage.setItem('nextern_drive_count', dd.drives.length);
                const badge = document.querySelector('.usb-badge');
                if (badge) badge.textContent = dd.drives.length;
            }
        } catch (_) { }
        try {
            // User readiness
            const ur = await fetch(`${API_BASE}/api/user/me`, { headers: { Authorization: `Bearer ${token}` } });
            const ud = await ur.json();
            if (ud.user) {
                const hasResume = !!ud.user.resumeUrl;
                // Calc simple readiness
                let total = 0, done = 0;
                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k && k.startsWith('nextern_prep_')) { total++; if (localStorage.getItem(k) === 'true') done++; }
                }
                readiness = Math.round((hasResume ? 30 : 0) + (total > 0 ? (done / total) * 40 : 0));
                localStorage.setItem('nextern_readiness', readiness);
                const fill = document.querySelector('.usb-r-bar-fill');
                const label = document.querySelector('.usb-r-label span:last-child');
                if (fill) fill.style.width = `${readiness}%`;
                if (label) label.textContent = `${readiness}%`;
            }
        } catch (_) { }
    }

    // 2. PATH DETECTION
    const isRoot = !window.location.pathname.includes('/pages/');
    const pagesBase = '/pages';
    const toPageHref = (file) => `${pagesBase}/${file}`;
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';

    // 3. ICONS
    const icons = {
        feed: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="s-icon"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>`,
        drives: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="s-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M9.348 14.651a3.75 3.75 0 0 1 0-5.303m5.304 0a3.75 3.75 0 0 1 0 5.303m-7.425 2.122a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M12 12h.008v.008H12V12Zm.375 0a.375 1.1 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>`,
        roadmap: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="s-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.446 1.972-1.479a.75.75 0 0 0 .254-.543V4.616a.75.75 0 0 0-1.23-.57L12.75 7.248 8.913 4.37a.75.75 0 0 0-1.214.583v12.793a.75.75 0 0 0 .253.543l1.971 1.479a.75.75 0 0 0 .812 0l3.904-2.928 3.904 2.928a.75.75 0 0 0 .812 0Z" /></svg>`,
        prep: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="s-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>`,
        seniors: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="s-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>`,
        dashboard: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="s-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" /></svg>`,
        admin: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="s-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>`,
        logout: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="s-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>`,
        toggle: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:24px;height:24px;"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>`,
        analyzer: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="s-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
        analytics: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="s-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /></svg>`
    };

    // 4. DYNAMIC POSITION DETECTION
    let topOffset = 0;
    const navbar = document.querySelector('.topnav') || document.querySelector('.navbar');
    const tb = document.querySelector('.topbar');
    const tr = document.querySelector('.top-row');

    if (navbar) {
        topOffset = navbar.offsetHeight || 60;
    } else if (tb) {
        topOffset = tb.offsetHeight || 64;
    } else if (tr && window.getComputedStyle(tr).position === 'fixed') {
        topOffset = tr.offsetHeight || 40;
    }

    // 5. CSS INJECTION
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        :root {
            --sidebar-width: 220px;
        }

        .usb-container {
            width: var(--sidebar-width);
            background: #ffffff;
            border-right: 1px solid #E2E8F0;
            height: calc(100vh - ${topOffset}px);
            position: fixed;
            top: ${topOffset}px;
            left: 0;
            display: flex;
            flex-direction: column;
            padding: 16px;
            font-family: 'Inter', sans-serif;
            z-index: 1001;
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .usb-collapsed {
            width: 64px;
            padding: 16px 8px;
        }

        .usb-nav {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
        }

        .usb-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            color: #64748B;
            text-decoration: none;
            font-size: 0.88rem;
            font-weight: 500;
            border-radius: 8px;
            transition: background 0.2s;
            white-space: nowrap;
            overflow: hidden;
        }

        .usb-collapsed .usb-link {
            justify-content: center;
            padding: 10px 0;
            gap: 0;
        }

        .usb-link:hover {
            background: #F1F5F9;
            color: #1E293B;
        }

        .usb-link.active {
            background: #EEF2FF;
            color: #6C63FF;
        }

        .s-icon {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
        }

        .usb-link span, .usb-badge, .usb-footer {
            transition: opacity 0.2s, visibility 0.2s;
        }

        .usb-collapsed .usb-link span, 
        .usb-collapsed .usb-badge, 
        .usb-collapsed .usb-footer {
            opacity: 0;
            visibility: hidden;
            width: 0;
        }

        .usb-badge {
            margin-left: auto;
            background: #6C63FF;
            color: white;
            font-size: 0.7rem;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 100px;
        }

        .usb-footer {
            margin-top: auto;
            padding-top: 24px;
            border-top: 1px solid #E2E8F0;
        }

        .usb-readiness { margin-bottom: 16px; }
        .usb-r-label {
            display: flex;
            justify-content: space-between;
            font-size: 0.75rem;
            font-weight: 600;
            color: #64748B;
            margin-bottom: 6px;
        }

        .usb-r-bar-bg { height: 6px; background: #E2E8F0; border-radius: 100px; overflow: hidden; }
        .usb-r-bar-fill { height: 100%; background: #6C63FF; border-radius: 100px; }

        .usb-logout { color: #EF4444 !important; }
        .usb-logout:hover { background: #FEF2F2; }

        /* Navbar Toggle Button */
        .usb-toggle-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            margin-right: 12px;
            color: #64748B;
            cursor: pointer;
            border-radius: 8px;
            transition: background 0.2s;
        }
        .usb-toggle-btn:hover { background: #F1F5F9; color: #1E293B; }
    `;
    document.head.appendChild(style);

    // 6. TOGGLE LOGIC
    let isCollapsed = localStorage.getItem('nextern_sidebar_collapsed') === 'true';

    function updateSidebarState() {
        const mount = document.getElementById('sidebar-mount');
        const container = mount?.querySelector('.usb-container');

        if (isCollapsed) {
            container?.classList.add('usb-collapsed');
            document.body.classList.add('usb-is-collapsed');
            document.documentElement.style.setProperty('--sidebar-width', '64px');
        } else {
            container?.classList.remove('usb-collapsed');
            document.body.classList.remove('usb-is-collapsed');
            document.documentElement.style.setProperty('--sidebar-width', '220px');
        }
        localStorage.setItem('nextern_sidebar_collapsed', isCollapsed);
    }

    // Set initial width immediately to avoid layout shift
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '64px' : '220px');

    function toggleSidebar() {
        isCollapsed = !isCollapsed;
        updateSidebarState();
    }
    window.toggleSidebar = toggleSidebar;

    // 7. NAVBAR BUTTON INJECTION
    if (navbar) {
        if (!navbar.querySelector('.usb-toggle-btn')) {
            const toggleBtn = document.createElement('div');
            toggleBtn.className = 'usb-toggle-btn';
            toggleBtn.innerHTML = icons.toggle;
            toggleBtn.onclick = toggleSidebar;

            const logo = navbar.querySelector('.nav-logo') || navbar.firstChild;
            navbar.insertBefore(toggleBtn, logo);
        }
    }

    // 8. HTML GENERATION
    // ... (rest of the menuItems and sidebarHTML generation)
    const menuItems = [
        { name: 'Feed', id: 'feed', file: 'feed.html', icon: icons.feed },
        { name: 'Drives', id: 'drives', file: 'drives.html', icon: icons.drives, badge: driveCount > 0 ? driveCount : null },
        { name: 'Resume Analyzer', id: 'analyzer', file: 'resume-analyzer.html', icon: icons.analyzer },
        { name: 'Roadmap', id: 'roadmap', file: 'roadmap.html', icon: icons.roadmap },
        { name: 'Prep Hub', id: 'prep', file: 'prep-hub.html', icon: icons.prep },
        { name: 'Seniors', id: 'seniors', file: 'seniors.html', icon: icons.seniors },
        { name: 'Dashboard', id: 'dashboard', file: 'dashboard.html', icon: icons.dashboard },
        { name: 'Analytics', id: 'analytics', file: 'analytics.html', icon: icons.analytics },
    ];

    if (isAdmin) {
        menuItems.push({ name: 'Admin Panel', id: 'admin', file: 'admin.html', icon: icons.admin });
    }

    const sidebarHTML = `
        <div class="usb-container ${isCollapsed ? 'usb-collapsed' : ''}">
            <nav class="usb-nav">
                ${menuItems.map(item => `
                    <a href="${toPageHref(item.file)}" class="usb-link ${currentFile === item.file ? 'active' : ''}">
                        ${item.icon}
                        <span>${item.name}</span>
                        ${item.badge ? `<span class="usb-badge">${item.badge}</span>` : ''}
                    </a>
                `).join('')}
            </nav>

            <div class="usb-footer">
                <div class="usb-readiness">
                    <div class="usb-r-label">
                        <span>Readiness</span>
                        <span>${readiness}%</span>
                    </div>
                    <div class="usb-r-bar-bg"><div class="usb-r-bar-fill" style="width: ${readiness}%"></div></div>
                </div>
                <a href="#" onclick="if(window.handleLogout) { window.handleLogout() } else { localStorage.clear(); window.location.href='/login.html' }" class="usb-link usb-logout">
                    ${icons.logout}
                    <span>Logout</span>
                </a>
            </div>
        </div>
    `;

    // 9. FINAL INJECTION
    const mount = document.getElementById('sidebar-mount');
    if (mount) {
        mount.innerHTML = sidebarHTML;
        updateSidebarState(); // Initial sync
        refreshLiveData();    // Fetch live counts
    }
})();
