/**
 * admin-saas.js
 * Complete Admin Dashboard Controller for Nextern Pro
 */

const API_BASE = window.API_BASE || 'http://localhost:4000';

const State = {
    currentView: 'dashboard',
    applications: [],
    dragAppId: null,
};

function getAdminHeaders(extra = {}) {
    const token = window.getAuthToken ? window.getAuthToken() : localStorage.getItem('nextern_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...extra,
    };
}

async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: getAdminHeaders(options.headers || {}),
    });

    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('nextern_token');
        window.location.href = '../login.html';
        throw new Error('Unauthorized');
    }

    const data = await res.json();
    if (!res.ok || data.success === false) {
        throw new Error(data.message || `Request failed: ${res.status}`);
    }

    return data;
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showLoading(container, text = 'Syncing data...') {
    container.innerHTML = `<div class="loading-state" style="padding:40px;color:var(--slate-500)">${escapeHtml(text)}</div>`;
}

function showError(container, message) {
    container.innerHTML = `<div class="error-state" style="padding:40px;color:#fca5a5">${escapeHtml(message)}</div>`;
}

// ── INITIALIZATION ──

async function init() {
    setupNavigation();
    setupSearch();
    await loadView('dashboard');
}

function setupNavigation() {
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            switchView(view);
        });
    });
}

function switchView(view) {
    State.currentView = view;
    document.querySelectorAll('.nav-item[data-view]').forEach(i => i.classList.remove('active'));
    const active = document.querySelector(`.nav-item[data-view="${view}"]`);
    if (active) active.classList.add('active');

    const container = document.getElementById('view-container');
    showLoading(container, 'Syncing data...');
    loadView(view);
}

async function loadView(view) {
    const container = document.getElementById('view-container');

    try {
        if (view === 'dashboard') return await renderDashboard(container);
        if (view === 'students') return await renderStudents(container);
        if (view === 'drives') return await renderDrives(container);
        if (view === 'ats') return await renderATS(container);
        if (view === 'announcements') return await renderAnnouncements(container);
        if (view === 'logs') return await renderLogs(container);

        container.innerHTML = `<h2>Coming Soon</h2><p>The ${escapeHtml(view)} module is currently being optimized.</p>`;
    } catch (err) {
        console.error(`Admin view load failed: ${view}`, err);
        showError(container, `Failed to load ${view}. ${err.message}`);
    }
}

// ── MODULE: DASHBOARD ──

async function renderDashboard(container) {
    const { data } = await apiFetch('/api/admin/analytics/overview');

    container.innerHTML = `
        <div class="view-section">
            <div class="kpi-grid">
                ${renderKPI('Total Students', data.totalStudents, `${data.onlineNow} online`, true)}
                ${renderKPI('Active Drives', data.totalDrives, `${data.totalApplications} total apps`, true)}
                ${renderKPI('Avg. CGPA', data.avgCGPA, 'Current student avg', false)}
                ${renderKPI('Placement Rate', `${data.placementRate}%`, 'Offered students / total', true)}
            </div>

            <div class="content-grid">
                <div class="glass-card">
                    <h3>Application Trends (Last 30 Days)</h3>
                    <div style="height: 300px; margin-top: 20px;">
                        <canvas id="mainTrendChart"></canvas>
                    </div>
                </div>
                <div class="glass-card">
                    <h3>Top Hiring Partners</h3>
                    <div id="topPartnerList" style="margin-top:20px;">
                        ${(Array.isArray(data.topDrives) && data.topDrives.length ? data.topDrives : [{ company: 'No data', role: '-', count: 0 }]).map(d => `
                            <div class="partner-row" style="display:flex; justify-content:space-between; padding: 12px 0; border-bottom: 1px solid var(--border);">
                                <div>
                                    <div style="font-weight:600; font-size:0.9rem;">${escapeHtml(d.company || 'Unknown')}</div>
                                    <div style="font-size:0.75rem; color:var(--slate-500);">${escapeHtml(d.role || '-')}</div>
                                </div>
                                <div style="font-weight:700; color:var(--brand);">${Number(d.count || 0)} Applied</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    const labels = (data.appsPerDay || []).map(d => d._id);
    const points = (data.appsPerDay || []).map(d => d.count);

    const ctx = document.getElementById('mainTrendChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Daily Applications',
                data: points,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.35,
                pointRadius: 2,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
            },
        },
    });
}

function renderKPI(label, val, trend, isUp) {
    return `
        <div class="glass-card kpi-card">
            <div class="kpi-label">${escapeHtml(label)}</div>
            <div class="kpi-value">${escapeHtml(String(val))}</div>
            <div class="kpi-trend ${isUp ? 'trend-up' : ''}">
                ${escapeHtml(trend)}
            </div>
        </div>
    `;
}

// ── MODULE: STUDENTS ──

async function renderStudents(container) {
    const { users } = await apiFetch('/api/admin/users');
    const students = (users || []).filter(u => u.role === 'student');

    container.innerHTML = `
        <div class="view-section">
            <div class="top-bar">
                <h2>Student Database</h2>
                <div style="display:flex; gap: 12px;">
                    <button class="btn btn-primary" onclick="window.exportStudents()">Export CSV</button>
                </div>
            </div>

            <div class="glass-card" style="padding:0; overflow:auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Branch</th>
                            <th>Year</th>
                            <th>CGPA</th>
                            <th>Targets</th>
                            <th>Verified</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(s => `
                            <tr>
                                <td>
                                    <div style="font-weight:600;">${escapeHtml(`${s.firstName || ''} ${s.lastName || ''}`.trim())}</div>
                                    <div style="font-size:0.75rem; color:var(--slate-500);">${escapeHtml(s.email || '-')}</div>
                                </td>
                                <td>${escapeHtml(s.branch || '-')}</td>
                                <td>${escapeHtml(s.year || '-')}</td>
                                <td style="font-weight:700; color:var(--brand);">${s.cgpa ?? '-'}</td>
                                <td>${escapeHtml((s.targetCompanies || []).slice(0, 2).join(', ') || '-')}</td>
                                <td>
                                    ${s.isVerified
                                        ? '<span style="color:var(--success)">✓ Verified</span>'
                                        : `<button onclick="verifyStudent('${s._id}')" style="font-size:0.7rem; padding:4px 8px; border-radius:4px; border:1px solid var(--border); background:none; color:white; cursor:pointer;">Verify</button>`}
                                </td>
                                <td>
                                    <button class="btn" style="padding:4px 8px;" onclick="viewStudentProfile('${s._id}')">View</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

window.verifyStudent = async (id) => {
    if (!confirm('Verify this student profile?')) return;
    await apiFetch(`/api/admin/students/${id}/verify`, { method: 'PUT' });
    switchView('students');
};

window.viewStudentProfile = async (id) => {
    try {
        const { student, applications } = await apiFetch(`/api/admin/students/${id}/profile`);
        alert(`${student.firstName} ${student.lastName}\nBranch: ${student.branch || '-'}\nCGPA: ${student.cgpa ?? '-'}\nApplications: ${(applications || []).length}`);
    } catch (e) {
        alert(`Could not load student profile: ${e.message}`);
    }
};

window.exportStudents = async () => {
    try {
        const { students } = await apiFetch('/api/admin/students/export');
        const rows = [
            ['First Name', 'Last Name', 'Email', 'College', 'Branch', 'Year', 'CGPA', 'Verified'],
            ...(students || []).map(s => [
                s.firstName || '',
                s.lastName || '',
                s.email || '',
                s.college || '',
                s.branch || '',
                s.year || '',
                s.cgpa ?? '',
                s.isVerified ? 'Yes' : 'No',
            ]),
        ];

        const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_export_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (e) {
        alert(`Export failed: ${e.message}`);
    }
};

// ── MODULE: DRIVES ──

async function renderDrives(container) {
    const { drives } = await apiFetch('/api/admin/drives');

    container.innerHTML = `
        <div class="view-section">
            <div class="top-bar">
                <h2>Placement Drives</h2>
                <div style="display:flex; gap: 12px;">
                    <button class="btn" style="background:var(--slate-800); color:white; border:1px solid var(--border);" onclick="bulkCloseExpiredDrives()">Close Expired</button>
                </div>
            </div>

            <div class="glass-card" style="padding:0; overflow:auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Company</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Deadline</th>
                            <th>Cutoff</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(drives || []).map(d => `
                            <tr>
                                <td style="font-weight:600;">${escapeHtml(d.company || '-')}</td>
                                <td>${escapeHtml(d.role || '-')}</td>
                                <td>${escapeHtml(d.status || 'open')}</td>
                                <td>${d.deadline ? new Date(d.deadline).toLocaleDateString('en-IN') : '-'}</td>
                                <td>${d.cgpaCutoff ?? 0}</td>
                                <td style="display:flex; gap:8px;">
                                    <button class="btn" style="padding:4px 8px;" onclick="toggleDriveClose('${d._id || d.id}')">${d.status === 'closed' ? 'Closed' : 'Close'}</button>
                                    <button class="btn" style="padding:4px 8px;" onclick="toggleDriveFeature('${d._id || d.id}')">${d.isFeatured ? 'Unfeature' : 'Feature'}</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

window.toggleDriveClose = async (id) => {
    await apiFetch(`/api/admin/drives/${id}/close`, { method: 'PUT' });
    switchView('drives');
};

window.toggleDriveFeature = async (id) => {
    await apiFetch(`/api/admin/drives/${id}/feature`, { method: 'PUT' });
    switchView('drives');
};

window.bulkCloseExpiredDrives = async () => {
    await apiFetch('/api/admin/drives/bulk-close', { method: 'POST' });
    switchView('drives');
};

// ── MODULE: ATS ──

const ATS_STAGES = ['applied', 'shortlisted', 'test', 'interview', 'offered', 'rejected'];

async function renderATS(container, preloadedApplications) {
    if (!Array.isArray(preloadedApplications)) {
        const driveId = document.getElementById('atsDriveFilter')?.value || '';
        const qs = driveId ? `?drive=${encodeURIComponent(driveId)}` : '';
        const { applications } = await apiFetch(`/api/admin/applications${qs}`);
        State.applications = applications || [];
    } else {
        State.applications = preloadedApplications;
    }

    const columns = ATS_STAGES.map(stage => ({
        id: stage,
        title: stage.charAt(0).toUpperCase() + stage.slice(1),
        items: State.applications.filter(a => a.status === stage),
    }));

    container.innerHTML = `
        <div class="view-section">
            <div class="top-bar">
                <h2>Recruitment Pipeline</h2>
                <select id="atsDriveFilter" onchange="filterATS()" class="btn" style="background:var(--slate-800); color:white; border:1px solid var(--border);">
                    <option value="">All Drives</option>
                    ${Array.from(new Map(State.applications.map(a => [a.drive?._id, a.drive?.company])).entries())
                        .filter(([id]) => id)
                        .map(([id, company]) => `<option value="${id}">${escapeHtml(company || 'Drive')}</option>`)
                        .join('')}
                </select>
            </div>

            <div class="kanban" style="grid-template-columns: repeat(6, 1fr);">
                ${columns.map(col => `
                    <div class="kanban-col" id="stage-${col.id}" ondragover="handleDragOver(event)" ondrop="handleDrop(event, '${col.id}')">
                        <div class="col-header">
                            <span class="col-title">${escapeHtml(col.title)}</span>
                            <span class="col-count">${col.items.length}</span>
                        </div>
                        <div class="col-body" style="min-height: 360px;">
                            ${col.items.map(item => `
                                <div class="kanban-card" draggable="true" ondragstart="handleDragStart(event, '${item._id}')">
                                    <h5>${escapeHtml(item.student?.firstName || '')} ${escapeHtml(item.student?.lastName || '')}</h5>
                                    <p>${escapeHtml(item.drive?.company || '-')}</p>
                                    <div style="font-size:0.7rem; color:var(--brand); margin-top:8px;">${escapeHtml(item.drive?.role || '-')}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

window.filterATS = async () => {
    const driveId = document.getElementById('atsDriveFilter')?.value || '';
    const qs = driveId ? `?drive=${encodeURIComponent(driveId)}` : '';
    const { applications } = await apiFetch(`/api/admin/applications${qs}`);
    const container = document.getElementById('view-container');
    await renderATS(container, applications || []);
};

window.handleDragStart = (e, id) => {
    State.dragAppId = id;
    e.dataTransfer.setData('text/plain', id);
};

window.handleDragOver = (e) => {
    e.preventDefault();
};

window.handleDrop = async (e, stage) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain') || State.dragAppId;
    if (!appId) return;
    if (!ATS_STAGES.includes(stage)) return;

    try {
        await apiFetch(`/api/admin/applications/${appId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: stage }),
        });
        await window.filterATS();
    } catch (err) {
        alert(`Failed to move application: ${err.message}`);
    }
};

// ── MODULE: ANNOUNCEMENTS ──

async function renderAnnouncements(container) {
    const { posts } = await apiFetch('/api/admin/posts');
    const systemPosts = (posts || []).filter(p => p.isSystem || p.type === 'announcement').slice(0, 20);

    container.innerHTML = `
        <div class="view-section">
            <div class="top-bar">
                <h2>Announcements</h2>
            </div>

            <div class="glass-card" style="margin-bottom:20px;">
                <div style="display:grid; gap:12px;">
                    <textarea id="announceMessage" placeholder="Write announcement to students..." style="min-height:90px; background:var(--slate-800); color:white; border:1px solid var(--border); border-radius:8px; padding:10px;"></textarea>
                    <div style="display:flex; gap:10px;">
                        <input id="announceBranch" placeholder="Target branch (optional)" style="flex:1; background:var(--slate-800); color:white; border:1px solid var(--border); border-radius:8px; padding:10px;" />
                        <input id="announceYear" placeholder="Target year (optional)" style="flex:1; background:var(--slate-800); color:white; border:1px solid var(--border); border-radius:8px; padding:10px;" />
                        <button class="btn btn-primary" onclick="sendAnnouncement()">Send</button>
                    </div>
                </div>
            </div>

            <div class="glass-card" style="padding:0; overflow:auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Author</th>
                            <th>Type</th>
                            <th>Content</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${systemPosts.length ? systemPosts.map(p => `
                            <tr>
                                <td>${escapeHtml(`${p.author?.firstName || ''} ${p.author?.lastName || ''}`.trim() || 'System')}</td>
                                <td>${escapeHtml(p.type || 'announcement')}</td>
                                <td style="max-width:520px; white-space:normal;">${escapeHtml(p.content || '')}</td>
                                <td>${new Date(p.createdAt).toLocaleString('en-IN')}</td>
                            </tr>
                        `).join('') : '<tr><td colspan="4" style="padding:20px; color:var(--slate-500);">No announcements yet.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

window.sendAnnouncement = async () => {
    const message = document.getElementById('announceMessage')?.value?.trim();
    const targetBranch = document.getElementById('announceBranch')?.value?.trim();
    const targetYear = document.getElementById('announceYear')?.value?.trim();

    if (!message) return alert('Please enter an announcement message.');

    await apiFetch('/api/admin/notify', {
        method: 'POST',
        body: JSON.stringify({
            message,
            type: 'announcement',
            targetBranch,
            targetYear,
        }),
    });

    switchView('announcements');
};

// ── MODULE: LOGS ──

async function renderLogs(container) {
    const { logs } = await apiFetch('/api/admin/activity-log');

    container.innerHTML = `
        <div class="view-section">
            <div class="top-bar">
                <h2>Activity Logs</h2>
            </div>

            <div class="glass-card" style="padding:0; overflow:auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>When</th>
                            <th>Admin</th>
                            <th>Action</th>
                            <th>Target</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(logs || []).length ? logs.map(log => `
                            <tr>
                                <td>${new Date(log.createdAt).toLocaleString('en-IN')}</td>
                                <td>${escapeHtml(`${log.admin?.firstName || ''} ${log.admin?.lastName || ''}`.trim() || '-')}</td>
                                <td>${escapeHtml(log.action || '-')}</td>
                                <td>${escapeHtml(log.target || '-')}</td>
                                <td style="max-width:380px; white-space:normal;">${escapeHtml(log.details ? JSON.stringify(log.details) : '-')}</td>
                            </tr>
                        `).join('') : '<tr><td colspan="5" style="padding:20px; color:var(--slate-500);">No activity logs found.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ── GLOBAL SEARCH ──

function setupSearch() {
    const searchInput = document.getElementById('globalSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', debounce(async (e) => {
        const q = e.target.value.trim();
        if (q.length < 2) return;

        try {
            const { students, drives, posts } = await apiFetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
            console.log('Admin search', { students, drives, posts });
        } catch (err) {
            console.warn('Search failed', err.message);
        }
    }, 400));
}

function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

document.addEventListener('DOMContentLoaded', init);
