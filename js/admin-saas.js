/**
 * admin-saas.js
 * Modular Dashboard Controller for Nextern Pro Admin
 */

const API_BASE = window.API_BASE || 'http://localhost:4000';
const HEADERS = window.getAuthHeaders();

const State = {
    currentView: 'dashboard',
    stats: null,
    students: [],
    applications: [],
    activity: [],
};

// ── INITIALIZATION ──

async function init() {
    setupNavigation();
    setupSearch();
    await loadView('dashboard');
}

function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            switchView(view);
        });
    });
}

function switchView(view) {
    State.currentView = view;
    // Update Sidebar UI
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    // Clear and Load
    const container = document.getElementById('view-container');
    container.innerHTML = `<div class="loading-state">Syncing data...</div>`;
    
    loadView(view);
}

async function loadView(view) {
    const container = document.getElementById('view-container');
    
    try {
        switch(view) {
            case 'dashboard':
                await renderDashboard(container);
                break;
            case 'students':
                await renderStudents(container);
                break;
            case 'ats':
                await renderATS(container);
                break;
            case 'logs':
                await renderLogs(container);
                break;
            case 'announcements':
                await renderAnnouncements(container);
                break;
            default:
                container.innerHTML = `<h2>Coming Soon</h2><p>The ${view} module is currently being optimized.</p>`;
        }
    } catch (err) {
        container.innerHTML = `<div class="error-state">Failed to load ${view}. Check console.</div>`;
        console.error(err);
    }
}

// ── MODULE: DASHBOARD ──

async function renderDashboard(container) {
    const res = await fetch(`${API_BASE}/api/admin/analytics/overview`, { headers: HEADERS });
    const { success, data } = await res.json();
    if (!success) throw new Error('Stats fetch failed');

    container.innerHTML = `
        <div class="view-section">
            <div class="kpi-grid">
                ${renderKPI('Total Students', data.totalStudents, '↑ 12%', true)}
                ${renderKPI('Active Drives', data.totalDrives, '↑ 4', true)}
                ${renderKPI('Avg. CGPA', data.avgCGPA, 'Stable', false)}
                ${renderKPI('Placement Rate', `${data.placementRate}%`, '↑ 5.2%', true)}
            </div>

            <div class="content-grid">
                <div class="glass-card">
                    <h3>Engagement Trends</h3>
                    <div style="height: 300px; margin-top: 20px;">
                        <canvas id="mainTrendChart"></canvas>
                    </div>
                </div>
                <div class="glass-card">
                    <h3>Top Hiring Partners</h3>
                    <div id="topPartnerList" style="margin-top:20px;">
                        ${data.topDrives.map(d => `
                            <div class="partner-row" style="display:flex; justify-content:space-between; padding: 12px 0; border-bottom: 1px solid var(--border);">
                                <div>
                                    <div style="font-weight:600; font-size:0.9rem;">${d.company}</div>
                                    <div style="font-size:0.75rem; color:var(--slate-500);">${d.role}</div>
                                </div>
                                <div style="font-weight:700; color:var(--brand);">${d.count} Applied</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Render Chart
    const ctx = document.getElementById('mainTrendChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.appsPerDay.map(d => d._id),
            datasets: [{
                label: 'Daily Applications',
                data: data.appsPerDay.map(d => d.count),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
                x: { grid: { display: false }, ticks: { color: '#64748b' } }
            }
        }
    });
}

function renderKPI(label, val, trend, isUp) {
    return `
        <div class="glass-card kpi-card">
            <div class="kpi-label">${label}</div>
            <div class="kpi-value">${val}</div>
            <div class="kpi-trend ${isUp ? 'trend-up' : ''}">
                ${trend} <span style="color:var(--slate-500)">vs last month</span>
            </div>
        </div>
    `;
}

// ── MODULE: STUDENTS ──

async function renderStudents(container) {
    const res = await fetch(`${API_BASE}/api/admin/users`, { headers: HEADERS });
    const { success, users } = await res.json();
    if (!success) throw new Error('Users fetch failed');
    
    const students = users.filter(u => u.role === 'student');

    container.innerHTML = `
        <div class="view-section">
            <div class="top-bar">
                <h2>Student Database</h2>
                <div style="display:flex; gap: 12px;">
                    <button class="btn btn-primary" onclick="window.exportStudents()">Export CSV</button>
                    <button class="btn" style="background:var(--slate-800); color:white;">Filters</button>
                </div>
            </div>
            
            <div class="glass-card" style="padding:0;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Branch</th>
                            <th>CGPA</th>
                            <th>Target Companies</th>
                            <th>Verify</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(s => `
                            <tr>
                                <td>
                                    <div style="font-weight:600;">${s.firstName} ${s.lastName}</div>
                                    <div style="font-size:0.75rem; color:var(--slate-500);">${s.email}</div>
                                </td>
                                <td>${s.branch || '-'}</td>
                                <td style="font-weight:700; color:var(--brand);">${s.cgpa || '-'}</td>
                                <td>${(s.targetCompanies || []).slice(0, 2).join(', ')}${(s.targetCompanies || []).length > 2 ? '...' : ''}</td>
                                <td>
                                    ${s.isVerified ? '<span style="color:var(--success)">✓ Verified</span>' : `<button onclick="verifyStudent('${s._id}')" style="font-size:0.7rem; padding:4px 8px; border-radius:4px; border:1px solid var(--border); background:none; color:white; cursor:pointer;">Verify</button>`}
                                </td>
                                <td><button class="btn" style="padding:4px 8px;">View</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ── MODULE: ATS (Kanban) ──

async function renderATS(container) {
    const res = await fetch(`${API_BASE}/api/admin/applications`, { headers: HEADERS });
    const { success, applications } = await res.json();
    
    const stages = ['applied', 'test', 'interview', 'offered'];
    const columns = stages.map(stage => ({
        id: stage,
        title: stage.charAt(0).toUpperCase() + stage.slice(1),
        items: applications.filter(a => a.status === stage)
    }));

    container.innerHTML = `
        <div class="view-section">
            <div class="top-bar">
                <h2>Recruitment Pipeline</h2>
                <select id="atsDriveFilter" onchange="filterATS()" class="btn" style="background:var(--slate-800); color:white; border:1px solid var(--border);">
                    <option value="">All Drives</option>
                </select>
            </div>

            <div class="kanban">
                ${columns.map(col => `
                    <div class="kanban-col" id="stage-${col.id}">
                        <div class="col-header">
                            <span class="col-title">${col.title}</span>
                            <span class="col-count">${col.items.length}</span>
                        </div>
                        <div class="col-body" style="min-height: 400px;">
                            ${col.items.map(item => `
                                <div class="kanban-card" draggable="true" ondragstart="handleDragStart(event, '${item._id}')">
                                    <h5>${item.student.firstName} ${item.student.lastName}</h5>
                                    <p>${item.drive.company}</p>
                                    <div style="font-size:0.7rem; color:var(--brand); margin-top:8px;">${item.drive.role}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ── UTILITIES ──

window.verifyStudent = async (id) => {
    if (!confirm('Verify this student profile?')) return;
    const res = await fetch(`${API_BASE}/api/admin/students/${id}/verify`, { method: 'PUT', headers: HEADERS });
    if ((await res.json()).success) switchView('students');
};

window.exportStudents = () => {
    alert('Generating student database export... CSV download will start shortly.');
};

function setupSearch() {
    const searchInput = document.getElementById('globalSearch');
    searchInput.addEventListener('input', debounce(async (e) => {
        const q = e.target.value;
        if (q.length < 2) return;
        
        const res = await fetch(`${API_BASE}/api/admin/search?q=${q}`, { headers: HEADERS });
        const { success, students, drives } = await res.json();
        if (success) console.log('Search Results:', { students, drives });
    }, 500));
}

function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// ── DRAG & DROP ──
window.handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
};

// Start the dashboard
document.addEventListener('DOMContentLoaded', init);
