/* ================================================================
   feed.js — fetches real posts from MongoDB and renders feed
   Save as: pages/feed.html (replace the <script> section)
   OR include as separate file
================================================================ */

const API_BASE = 'http://localhost:4000';
let currentTab = 'all';
let allPosts = [];

/* ================================================================
   INIT
================================================================ */
async function initFeed() {
    // Read token from URL (Google OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromGoogle = urlParams.get('token');
    const nameFromGoogle = urlParams.get('name');
    if (tokenFromGoogle) {
        localStorage.setItem('nextern_token', tokenFromGoogle);
        if (nameFromGoogle) localStorage.setItem('nextern_name', decodeURIComponent(nameFromGoogle));
        window.history.replaceState({}, '', window.location.pathname);
    }

    // Check auth
    const token = localStorage.getItem('nextern_token');
    if (!token) { window.location.href = '../login.html'; return; }

    setUserInfo();
    await loadPosts();
}

/* ================================================================
   SET USER INFO
================================================================ */
function setUserInfo() {
    const name = localStorage.getItem('nextern_name') || 'User';
    const first = name.split(' ')[0];

    const avatarEls = document.querySelectorAll('[id="navAvatar"], [id="feedAvatar"], [id="sideAvatar"]');
    avatarEls.forEach(el => el && (el.textContent = first.charAt(0).toUpperCase()));

    const nameEls = document.querySelectorAll('[id="sideUserName"]');
    nameEls.forEach(el => el && (el.textContent = name));

    const user = JSON.parse(localStorage.getItem('nextern_user') || '{}');
    const subEls = document.querySelectorAll('[id="sideUserSub"]');
    subEls.forEach(el => el && (el.textContent = `${user.branch || 'Engineering'} • ${user.year || ''}`));
}

/* ================================================================
   LOAD POSTS FROM API
================================================================ */
async function loadPosts() {
    const token = localStorage.getItem('nextern_token');
    const feedEl = document.getElementById('feedPosts');

    if (feedEl) feedEl.innerHTML = renderSkeleton();

    try {
        const response = await fetch(`${API_BASE}/api/posts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (!data.success) throw new Error(data.message);

        allPosts = data.posts || [];
        renderPosts(allPosts);

    } catch (error) {
        const feedEl = document.getElementById('feedPosts');
        if (feedEl) feedEl.innerHTML = `
      <div style="text-align:center;padding:40px;color:#64748B">
        <div style="font-size:2rem;margin-bottom:12px">😕</div>
        <p>Could not load posts. Make sure the server is running.</p>
      </div>`;
    }
}

/* ================================================================
   RENDER POSTS
================================================================ */
function renderPosts(posts) {
    const feedEl = document.getElementById('feedPosts');
    if (!feedEl) return;

    // Filter by tab
    let filtered = posts;
    if (currentTab === 'drives') filtered = posts.filter(p => p.type === 'drive');
    if (currentTab === 'tips') filtered = posts.filter(p => p.type === 'tip');
    if (currentTab === 'progress') filtered = posts.filter(p => p.type === 'progress');

    if (!filtered.length) {
        feedEl.innerHTML = `
      <div style="text-align:center;padding:40px;color:#64748B">
        <div style="font-size:2rem;margin-bottom:12px">📭</div>
        <p>No posts in this category yet.</p>
      </div>`;
        return;
    }

    feedEl.innerHTML = filtered.map(post => renderPost(post)).join('');
}

/* ================================================================
   RENDER SINGLE POST
================================================================ */
function renderPost(post) {
    const author = post.author || {};
    const name = `${author.firstName || 'Nextern'} ${author.lastName || 'Team'}`;
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const college = author.college || 'Nextern Platform';
    const timeAgo = getTimeAgo(post.createdAt);
    const likesCount = post.likes?.length || 0;
    const typeConfig = getTypeConfig(post.type);
    const userId = getUserId();
    const isLiked = post.likes?.some(id => id === userId || id?._id === userId);

    // Drive card style for drive posts
    const driveExtra = post.type === 'drive' && post.meta?.company ? `
    <div style="
      background:#F8F9FF; border:1px solid #E2E8F0; border-radius:10px;
      padding:12px 14px; margin-top:12px; display:flex; align-items:center; gap:12px;
    ">
      <div style="
        width:36px; height:36px; border-radius:8px;
        background:linear-gradient(135deg,#6C63FF,#4C1D95);
        display:flex; align-items:center; justify-content:center;
        color:#fff; font-weight:700; font-size:0.8rem; flex-shrink:0;
      ">${post.meta.company.charAt(0)}</div>
      <div style="flex:1">
        <div style="font-weight:600;font-size:0.88rem">${post.meta.company} — ${post.meta.role || ''}</div>
        <div style="font-size:0.76rem;color:#64748B">${post.meta.package || ''} ${post.meta.deadline ? '· Deadline: ' + formatDate(post.meta.deadline) : ''}</div>
      </div>
      ${post.meta.applyUrl ? `
        <a href="${post.meta.applyUrl}" target="_blank" style="
          padding:6px 14px; background:#6C63FF; color:#fff;
          border-radius:8px; font-size:0.78rem; font-weight:600;
          text-decoration:none; flex-shrink:0;
        ">Apply →</a>
      ` : ''}
    </div>
  ` : '';

    return `
    <div class="feed-post" id="post-${post._id}" style="
      background:#fff; border:1px solid #E2E8F0; border-radius:14px;
      padding:20px; margin-bottom:14px; box-shadow:0 1px 3px rgba(0,0,0,0.05);
      transition: box-shadow 0.15s;
    " onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'"
       onmouseout="this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)'">

      <!-- Post header -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <div style="
          width:38px; height:38px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg,${typeConfig.avatarBg});
          display:flex; align-items:center; justify-content:center;
          font-weight:700; font-size:0.82rem; color:#fff;
        ">${post.isSystem ? typeConfig.icon : initials}</div>
        <div style="flex:1">
          <div style="font-weight:600;font-size:0.88rem">${post.isSystem ? typeConfig.authorName : name}</div>
          <div style="font-size:0.74rem;color:#94A3B8">${post.isSystem ? typeConfig.authorSub : college} · ${timeAgo}</div>
        </div>
        <span style="
          font-size:0.68rem; font-weight:600; padding:3px 10px;
          border-radius:100px; background:${typeConfig.tagBg}; color:${typeConfig.tagColor};
        ">${typeConfig.label}</span>
      </div>

      <!-- Post content -->
      <p style="font-size:0.88rem;line-height:1.7;color:#0F172A;white-space:pre-wrap">${escapeHtml(post.content)}</p>

      ${driveExtra}

      <!-- Post actions -->
      <div style="
        display:flex; align-items:center; gap:16px; margin-top:14px;
        padding-top:12px; border-top:1px solid #F1F5F9;
      ">
        <button onclick="toggleLike('${post._id}', this)" style="
          display:flex; align-items:center; gap:5px;
          font-size:0.8rem; color:${isLiked ? '#6C63FF' : '#94A3B8'};
          background:none; border:none; cursor:pointer; padding:4px 8px;
          border-radius:6px; transition:all 0.15s; font-family:inherit;
        " onmouseover="this.style.background='#F1F5F9'" onmouseout="this.style.background='none'">
          <span style="font-size:1rem">${isLiked ? '❤️' : '🤍'}</span>
          <span class="like-count-${post._id}">${likesCount}</span>
        </button>

        <button style="
          display:flex; align-items:center; gap:5px;
          font-size:0.8rem; color:#94A3B8;
          background:none; border:none; cursor:pointer; padding:4px 8px;
          border-radius:6px; font-family:inherit;
        " onmouseover="this.style.background='#F1F5F9'" onmouseout="this.style.background='none'">
          <span style="font-size:1rem">💬</span> Comment
        </button>

        <button style="
          display:flex; align-items:center; gap:5px;
          font-size:0.8rem; color:#94A3B8;
          background:none; border:none; cursor:pointer; padding:4px 8px;
          border-radius:6px; font-family:inherit;
        " onmouseover="this.style.background='#F1F5F9'" onmouseout="this.style.background='none'">
          <span style="font-size:1rem">↗️</span> Share
        </button>
      </div>
    </div>
  `;
}

/* ================================================================
   TOGGLE LIKE
================================================================ */
async function toggleLike(postId, btn) {
    const token = localStorage.getItem('nextern_token');

    try {
        const response = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (!data.success) return;

        // Update UI
        const heartEl = btn.querySelector('span:first-child');
        const countEl = document.querySelector(`.like-count-${postId}`);
        heartEl.textContent = data.liked ? '❤️' : '🤍';
        countEl.textContent = data.likes;
        btn.style.color = data.liked ? '#6C63FF' : '#94A3B8';

    } catch (error) {
        console.error('Like error:', error);
    }
}

/* ================================================================
   CREATE POST
================================================================ */
async function createPost() {
    const token = localStorage.getItem('nextern_token');
    const textarea = document.getElementById('postInput');
    const content = textarea?.value?.trim();

    if (!content) return;

    const btn = document.getElementById('postBtn');
    if (btn) { btn.textContent = 'Posting...'; btn.disabled = true; }

    try {
        const response = await fetch(`${API_BASE}/api/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content, type: 'general' })
        });

        const data = await response.json();

        if (data.success) {
            textarea.value = '';
            allPosts.unshift(data.post); // add to top
            renderPosts(allPosts);
        }

    } catch (error) {
        console.error('Create post error:', error);
    } finally {
        if (btn) { btn.textContent = 'Post'; btn.disabled = false; }
    }
}

/* ================================================================
   TAB SWITCHING
================================================================ */
function setTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
    renderPosts(allPosts);
}

/* ================================================================
   HELPERS
================================================================ */
function getTypeConfig(type) {
    const configs = {
        drive: {
            label: '📡 New Drive', tagBg: '#EFF6FF', tagColor: '#3B82F6',
            avatarBg: '#6C63FF,#4C1D95', icon: '📡',
            authorName: 'Nextern Drives', authorSub: 'Auto-scraped daily',
        },
        tip: {
            label: '💡 Tip', tagBg: '#FFF7ED', tagColor: '#F59E0B',
            avatarBg: '#F59E0B,#D97706', icon: '💡',
            authorName: 'Senior Insights', authorSub: 'Placed students',
        },
        progress: {
            label: '📊 Update', tagBg: '#F0FDF4', tagColor: '#22C55E',
            avatarBg: '#22C55E,#16A34A', icon: '📊',
            authorName: 'Nextern Stats', authorSub: 'Platform update',
        },
        announcement: {
            label: '📣 Announcement', tagBg: '#FDF4FF', tagColor: '#9333EA',
            avatarBg: '#9333EA,#6B21A8', icon: '📣',
            authorName: 'Nextern Team', authorSub: 'Official',
        },
        general: {
            label: '💬 Post', tagBg: '#F1F5F9', tagColor: '#64748B',
            avatarBg: '#64748B,#475569', icon: '💬',
            authorName: 'Community', authorSub: '',
        },
    };
    return configs[type] || configs.general;
}

function getTimeAgo(dateStr) {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function getUserId() {
    const user = JSON.parse(localStorage.getItem('nextern_user') || '{}');
    return user.id || user._id || '';
}

function renderSkeleton() {
    return Array(3).fill(`
    <div style="background:#fff;border:1px solid #E2E8F0;border-radius:14px;padding:20px;margin-bottom:14px">
      <div style="display:flex;gap:10px;margin-bottom:14px">
        <div style="width:38px;height:38px;border-radius:50%;background:#F1F5F9"></div>
        <div>
          <div style="width:120px;height:12px;background:#F1F5F9;border-radius:4px;margin-bottom:6px"></div>
          <div style="width:80px;height:10px;background:#F1F5F9;border-radius:4px"></div>
        </div>
      </div>
      <div style="height:12px;background:#F1F5F9;border-radius:4px;margin-bottom:8px"></div>
      <div style="height:12px;background:#F1F5F9;border-radius:4px;width:80%"></div>
    </div>
  `).join('');
}

// Init on page load
document.addEventListener('DOMContentLoaded', initFeed);