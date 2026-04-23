/**
 * admin-saas.js
 * Complete Admin Dashboard Controller for NexConsole
 */

const API_BASE = window.API_BASE || 'http://localhost:4000';

const State = {
    currentView: 'dashboard',
    stats: {}
};

function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('nextern_token')}`
    };
}

// ── NAVIGATION ──
function setupNavigation() {
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(item.dataset.view);
        });
    });
}

async function switchView(view) {
    State.currentView = view;
    // Update active state
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`.nav-item[data-view="${view}"]`)?.classList.add('active');
    
    // Update title
    const titles = {
        'dashboard': 'Dashboard',
        'analytics': 'Placement Analytics',
        'students': 'Student Database',
        'drives': 'Company Drives',
        'feed': 'Post Management',
        'resources': 'Resource Library',
        'announcements': 'Global Announcements',
        'notifications': 'System Notifications',
        'add-drive': 'Add New Drive'
    };
    document.getElementById('currentViewTitle').textContent = titles[view] || 'Admin';

    const container = document.getElementById('view-container');
    container.innerHTML = `<div style="padding:40px; color:var(--text-muted);">Syncing view...</div>`;

    try {
        if (view === 'dashboard') await renderDashboard(container);
        else if (view === 'announcements') await renderAnnouncements(container);
        else if (view === 'students') await renderStudents(container);
        else if (view === 'drives') await renderDrives(container);
        else if (view === 'analytics') await renderAnalytics(container);
        else if (view === 'add-drive') await renderAddDrive(container);
        else {
            container.innerHTML = `<div style="padding:40px;"><h2>Module Coming Soon</h2><p>The ${view} feature is currently being optimized.</p></div>`;
        }
    } catch (err) {
        container.innerHTML = `<div style="padding:40px; color:var(--accent-red);">Error: ${err.message}</div>`;
    }
}

// ── MODULE: DASHBOARD ──
async function renderDashboard(container) {
    const res = await fetch(`${API_BASE}/api/admin/stats`, { headers: getHeaders() });
    const { stats } = await res.json();
    State.stats = stats;

    container.innerHTML = `
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="label">Total Students</div>
                <div class="value">${stats.totalStudents}</div>
                <div class="sub">${stats.onlineNow} currently online</div>
            </div>
            <div class="kpi-card">
                <div class="label">This Week</div>
                <div class="value">${stats.newUsers}</div>
                <div class="sub">New sign-ups in last 7 days</div>
            </div>
            <div class="kpi-card">
                <div class="label">Active Drives</div>
                <div class="value">${stats.totalDrives}</div>
                <div class="sub">${stats.totalApplications} applications tracked</div>
            </div>
            <div class="kpi-card">
                <div class="label">Placement Rate</div>
                <div class="value">${stats.placementRate || '0'}%</div>
                <div class="sub">Across all branches</div>
            </div>
        </div>

        <div class="content-grid">
            <div class="card">
                <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> Top Branches</h3>
                <div id="branchChartCont">
                    ${stats.branchStats.length ? stats.branchStats.map(b => `
                        <div style="display:flex; justify-content:space-between; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid var(--border);">
                            <span>${b._id}</span>
                            <b>${b.count} Students</b>
                        </div>
                    `).join('') : '<div style="color:var(--text-muted)">No data yet.</div>'}
                </div>
                <div style="position:absolute; top:20px; right:20px; opacity:0.3; font-weight:800; font-size:0.8rem;">${stats.totalStudents}</div>
            </div>

            <div class="card">
                <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 7h18M5 21V7m14 14V7m-7 14V7"/></svg> Top Colleges</h3>
                <div id="collegeChartCont">
                    ${stats.collegeStats.length ? stats.collegeStats.map(c => `
                        <div style="display:flex; justify-content:space-between; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid var(--border);">
                            <span>${c._id}</span>
                            <b>${c.count}</b>
                        </div>
                    `).join('') : '<div style="color:var(--text-muted)">No data yet.</div>'}
                </div>
                <div style="position:absolute; top:20px; right:20px; opacity:0.3; font-weight:800; font-size:0.8rem;">${stats.collegeStats.length}</div>
            </div>
        </div>

        <div class="content-grid" style="margin-top:24px;">
             <div class="card">
                <h3>Recent Sign-ups</h3>
                <table class="data-table">
                    <thead>
                        <tr><th>Student</th><th>Branch</th><th>CGPA</th><th>Joined</th></tr>
                    </thead>
                    <tbody id="signupTableBody">
                        <!-- Filled after fetch -->
                        <tr><td colspan="4" style="text-align:center; padding:40px;">No students yet.</td></tr>
                    </tbody>
                </table>
            </div>

            <div class="card">
                <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Needs Attention</h3>
                <div class="attention-item">
                    <div class="attention-label">
                        <b>Drives expiring</b>
                        <span>in the next 7 days</span>
                    </div>
                    <div class="count" id="expiringCount">0</div>
                </div>
                <div class="attention-item">
                    <div class="attention-label">
                        <b>Incomplete profiles</b>
                        <span>missing key info</span>
                    </div>
                    <div class="count" id="incompleteCount" style="color:var(--accent-red)">0</div>
                </div>
            </div>
        </div>
    `;

    loadDashboardSecondary();
}

async function loadDashboardSecondary() {
    try {
        const studentRes = await fetch(`${API_BASE}/api/admin/users`, { headers: getHeaders() });
        const { users } = await studentRes.json();
        const students = users.filter(u => u.role === 'student').slice(0, 5);
        
        const tableBody = document.getElementById('signupTableBody');
        if(students.length) {
            tableBody.innerHTML = students.map(s => `
                <tr>
                    <td>${s.firstName} ${s.lastName} <div style="font-size:0.7rem; color:var(--text-muted)">${s.email}</div></td>
                    <td>${s.branch || '-'}</td>
                    <td>${s.cgpa || '-'}</td>
                    <td>${new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
            `).join('');
        }

        const driveRes = await fetch(`${API_BASE}/api/admin/drives/expiring`, { headers: getHeaders() });
        const { drives } = await driveRes.json();
        document.getElementById('expiringCount').textContent = drives.length;

        const incompleteRes = await fetch(`${API_BASE}/api/admin/students/incomplete`, { headers: getHeaders() });
        const { students: inc } = await incompleteRes.json();
        document.getElementById('incompleteCount').textContent = inc.length;

    } catch(e) { console.error('Secondary Dashboard Load Error', e); }
}

// ── MODULE: ANNOUNCEMENTS ──
async function renderAnnouncements(container) {
    container.innerHTML = `
        <div class="content-grid" style="grid-template-columns: 1fr 1.5fr;">
            <div class="card">
                <h3>Post Announcement</h3>
                <form id="announceForm" class="announcement-form">
                    <div class="input-group">
                        <label>Announcement Type</label>
                        <select id="annType" class="input-select">
                            <option value="general">📢 General Update</option>
                            <option value="drive">💼 Placement Drive</option>
                            <option value="event">📅 Event/Workshop</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Title</label>
                        <input type="text" id="annTitle" class="input-text" placeholder="e.g. Google Drive Update">
                    </div>
                    <div class="input-group">
                        <label>Content</label>
                        <textarea id="annContent" class="input-area" placeholder="Write your message here..."></textarea>
                    </div>
                    
                    <div class="input-group">
                        <label>Target Branches</label>
                        <div class="multi-select-grid" id="branchSelector">
                            <label class="check-pill active"><input type="checkbox" value="All" checked> All</label>
                            <label class="check-pill"><input type="checkbox" value="CSE"> CSE</label>
                            <label class="check-pill"><input type="checkbox" value="IT"> IT</label>
                            <label class="check-pill"><input type="checkbox" value="ECE"> ECE</label>
                            <label class="check-pill"><input type="checkbox" value="MECH"> MECH</label>
                            <label class="check-pill"><input type="checkbox" value="CIVIL"> CIVIL</label>
                        </div>
                    </div>

                    <button type="submit" class="btn-action btn-primary" style="margin-top:12px; width:100%; justify-content:center;">Post Announcement</button>
                </form>
            </div>

            <div class="card">
                <h3>Recent Announcements</h3>
                <div id="announceList" style="display:flex; flex-direction:column; gap:16px;">
                    <div class="card-loading">Fetching history...</div>
                </div>
            </div>
        </div>
    `;

    // Setup Branch Multi-Select
    const pills = document.querySelectorAll('.check-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            const cb = pill.querySelector('input');
            cb.checked = !cb.checked;
            pill.classList.toggle('active', cb.checked);
            
            // Logic: If "All" is selected, others deselect. If others selected, "All" deselects.
            if(cb.value === 'All' && cb.checked) {
                pills.forEach(p => { if(p !== pill) { p.classList.remove('active'); p.querySelector('input').checked = false; } });
            } else if(cb.value !== 'All' && cb.checked) {
                const allPill = Array.from(pills).find(p => p.querySelector('input').value === 'All');
                allPill.classList.remove('active');
                allPill.querySelector('input').checked = false;
            }
        });
    });

    document.getElementById('announceForm').onsubmit = handleAnnounceSubmit;
    loadAnnouncementsHistory();
}

async function handleAnnounceSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('annTitle').value;
    const content = document.getElementById('annContent').value;
    const type = document.getElementById('annType').value;
    const branches = Array.from(document.querySelectorAll('#branchSelector input:checked')).map(i => i.value);

    if(!title || !content) return alert('Fill title and content');

    try {
        const res = await fetch(`${API_BASE}/api/admin/announcements`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ title, content, type, targetBranches: branches })
        });
        if(res.ok) {
            alert('Success!');
            switchView('announcements');
        }
    } catch(err) { alert('Error: ' + err.message); }
}

async function loadAnnouncementsHistory() {
    const res = await fetch(`${API_BASE}/api/admin/announcements`, { headers: getHeaders() });
    const { announcements } = await res.json();
    const list = document.getElementById('announceList');
    
    if(!announcements.length) {
        list.innerHTML = '<div style="color:var(--text-muted)">No announcements posted yet.</div>';
        return;
    }

    list.innerHTML = announcements.map(a => `
        <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border); padding:16px; border-radius:12px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span style="font-size:0.7rem; text-transform:uppercase; font-weight:800; color:var(--primary);">${a.type}</span>
                <span style="font-size:0.7rem; color:var(--text-muted);">${new Date(a.createdAt).toLocaleString()}</span>
            </div>
            <b style="display:block; margin-bottom:4px;">${a.title}</b>
            <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.5;">${a.content}</p>
            <div style="margin-top:12px; display:flex; gap:8px;">
                ${a.targetBranches.map(b => `<span style="font-size:0.65rem; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:4px;">${b}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// ── MODULE: STUDENTS ──
async function renderStudents(container) {
    const res = await fetch(`${API_BASE}/api/admin/users`, { headers: getHeaders() });
    const { users } = await res.json();
    const students = users.filter(u => u.role === 'student');

    container.innerHTML = `
        <div class="card" style="padding:0; overflow:hidden;">
            <div style="padding:24px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                <h3>Active Students</h3>
                <span style="font-size:0.8rem; color:var(--text-muted);">${students.length} Total</span>
            </div>
            <table class="data-table">
                <thead>
                    <tr><th>Student</th><th>Branch</th><th>Year</th><th>CGPA</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    ${students.map(s => `
                        <tr>
                            <td>
                                <b>${s.firstName} ${s.lastName}</b>
                                <div style="font-size:0.75rem; color:var(--text-muted)">${s.email}</div>
                            </td>
                            <td>${s.branch || '-'}</td>
                            <td>${s.year || '-'}</td>
                            <td style="color:var(--primary); font-weight:700;">${s.cgpa || '-'}</td>
                            <td>
                                <button class="btn-action" style="padding:4px 10px; font-size:0.75rem;">View</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ── MODULE: DRIVES ──
async function renderDrives(container) {
    const res = await fetch(`${API_BASE}/api/admin/drives`, { headers: getHeaders() });
    const { drives } = await res.json();

    container.innerHTML = `
        <div class="card" style="padding:0; overflow:hidden;">
            <div style="padding:24px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                <h3>Company Recruitment Drives</h3>
                <button class="btn-action btn-primary" onclick="switchView('add-drive')">+ New Drive</button>
            </div>
            <table class="data-table">
                <thead>
                    <tr><th>Company</th><th>Role</th><th>Package</th><th>Deadline</th><th>Status</th></tr>
                </thead>
                <tbody>
                    ${drives.map(d => `
                        <tr>
                            <td><b>${d.company}</b></td>
                            <td>${d.role}</td>
                            <td>${d.package || '-'}</td>
                            <td>${d.deadline ? new Date(d.deadline).toLocaleDateString() : '-'}</td>
                            <td>
                                <span style="background:${d.status === 'open' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}; color:${d.status === 'open' ? 'var(--accent-green)' : 'var(--accent-red)'}; padding:4px 8px; border-radius:4px; font-size:0.7rem; font-weight:700; text-transform:uppercase;">
                                    ${d.status}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ── MODULE: ANALYTICS ──
async function renderAnalytics(container) {
    container.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
            <div class="card">
                <h3>Branch Distribution</h3>
                <div style="height:300px;"><canvas id="branchChart"></canvas></div>
            </div>
            <div class="card">
                <h3>Application Trends</h3>
                <div style="height:300px;"><canvas id="appTrendChart"></canvas></div>
            </div>
        </div>
    `;
    
    // In a real app, I'd initialize Chart.js here using data from State.stats
}

// ── MODULE: ADD DRIVE ──
async function renderAddDrive(container) {
    container.innerHTML = `
        <div class="card" style="max-width:800px;">
            <h3>Create New Recruitment Drive</h3>
            <form id="addDriveForm" class="announcement-form" style="margin-top:20px;">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                    <div class="input-group">
                        <label>Company Name</label>
                        <input type="text" id="drName" class="input-text" placeholder="e.g. Microsoft">
                    </div>
                    <div class="input-group">
                        <label>Job Role</label>
                        <input type="text" id="drRole" class="input-text" placeholder="e.g. SDE-1">
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:16px;">
                    <div class="input-group">
                        <label>Package/Salary (Optional)</label>
                        <input type="text" id="drPackage" class="input-text" placeholder="e.g. 18 LPA">
                    </div>
                    <div class="input-group">
                        <label>CGPA Cutoff</label>
                        <input type="number" step="0.1" id="drCutoff" class="input-text" value="7.0">
                    </div>
                </div>
                <div class="input-group" style="margin-top:16px;">
                    <label>Application Deadline</label>
                    <input type="date" id="drDeadline" class="input-text">
                </div>
                <div class="input-group" style="margin-top:16px;">
                    <label>Job Description & Requirements</label>
                    <textarea id="drDescription" class="input-area" placeholder="Paste JD here..."></textarea>
                </div>
                <button type="submit" class="btn-action btn-primary" style="margin-top:24px; width:100%; justify-content:center;">Launch Drive</button>
            </form>
        </div>
    `;

    document.getElementById('addDriveForm').onsubmit = handleAddDriveSubmit;
}

async function handleAddDriveSubmit(e) {
    e.preventDefault();
    const payload = {
        company: document.getElementById('drName').value,
        role: document.getElementById('drRole').value,
        package: document.getElementById('drPackage').value,
        cgpaCutoff: document.getElementById('drCutoff').value,
        deadline: document.getElementById('drDeadline').value,
        description: document.getElementById('drDescription').value,
    };

    if(!payload.company || !payload.role) return alert('Fill required fields');

    try {
        const res = await fetch(`${API_BASE}/api/admin/drives`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            alert('Drive Launched Successfully!');
            switchView('drives');
        }
    } catch(err) { alert('Launch Error: ' + err.message); }
}

// ── INITIALIZATION ──
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    switchView('dashboard');
});
