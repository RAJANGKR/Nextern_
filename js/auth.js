/* ================================================================
   js/auth.js — Nextern Auth
   Used by: register.html
   login.html has its own inline script.
================================================================ */

/* ── UTILITIES ── */
function showError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const errorEl = document.getElementById(errorId);
    if (input) input.classList.add('error');
    if (errorEl) errorEl.textContent = message;
}

function clearError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const errorEl = document.getElementById(errorId);
    if (input) input.classList.remove('error');
    if (errorEl) errorEl.textContent = '';
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text'; btn.textContent = '🙈';
    } else {
        input.type = 'password'; btn.textContent = '👁';
    }
}

/* ── PASSWORD STRENGTH ── */
function initPasswordStrength() {
    const input = document.getElementById('regPassword');
    if (!input) return;
    input.addEventListener('input', function () {
        let score = 0;
        if (this.value.length >= 8) score++;
        if (/[A-Z]/.test(this.value)) score++;
        if (/[0-9]/.test(this.value)) score++;
        if (/[^A-Za-z0-9]/.test(this.value)) score++;
        const levels = [
            { width: '0%', color: '', text: '' },
            { width: '25%', color: '#EF4444', text: 'Weak' },
            { width: '50%', color: '#F59E0B', text: 'Fair' },
            { width: '75%', color: '#3B82F6', text: 'Good' },
            { width: '100%', color: '#22C55E', text: 'Strong ✓' },
        ];
        const bar = document.getElementById('pwStrengthBar');
        const label = document.getElementById('pwStrengthLabel');
        if (bar) { bar.style.width = levels[score].width; bar.style.background = levels[score].color; }
        if (label) { label.textContent = levels[score].text; label.style.color = levels[score].color; }
    });
}

/* ── TAG INPUT ── */
const tagState = { skills: [], companies: [] };

function initTagInput(inputId, wrapperId, hiddenId, stateKey) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const value = this.value.replace(',', '').trim();
            if (value) addTag(value, wrapperId, hiddenId, stateKey);
            this.value = '';
        }
    });
}

function addTag(value, wrapperId, hiddenId, stateKey) {
    const state = tagState[stateKey];
    if (state.some(t => t.toLowerCase() === value.toLowerCase())) return;
    state.push(value);
    renderTags(wrapperId, hiddenId, stateKey);
}

function removeTag(value, wrapperId, hiddenId, stateKey) {
    tagState[stateKey] = tagState[stateKey].filter(t => t !== value);
    renderTags(wrapperId, hiddenId, stateKey);
}

function renderTags(wrapperId, hiddenId, stateKey) {
    const wrap = document.getElementById(wrapperId);
    const hidden = document.getElementById(hiddenId);
    const input = wrap?.querySelector('input[type="text"]');
    if (!wrap || !hidden || !input) return;
    wrap.querySelectorAll('.tag').forEach(t => t.remove());
    tagState[stateKey].forEach(value => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.innerHTML = `${value}<button class="tag-remove" type="button" onclick="removeTag('${value}','${wrapperId}','${hiddenId}','${stateKey}')">×</button>`;
        wrap.insertBefore(tag, input);
    });
    hidden.value = tagState[stateKey].join(',');
}

/* ── REGISTER ── */
async function handleRegister() {
    // Clear all errors
    ['firstName', 'lastName', 'regEmail', 'phone', 'regPassword',
        'college', 'branch', 'year', 'cgpa', 'graduationYear', 'terms'].forEach(id => {
            clearError(id, id + 'Error');
        });
    document.getElementById('skillsError').textContent = '';
    document.getElementById('companiesError').textContent = '';

    let valid = true;

    // Collect values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('regPassword').value;
    const college = document.getElementById('college').value.trim();
    const branch = document.getElementById('branch').value;
    const year = document.getElementById('year').value;
    const cgpa = document.getElementById('cgpa').value;
    const gradYear = document.getElementById('graduationYear').value;
    const skills = document.getElementById('skillsHidden').value;
    const companies = document.getElementById('companiesHidden').value;
    const terms = document.getElementById('terms').checked;

    // Validate
    if (!firstName) { showError('firstName', 'firstNameError', 'First name is required.'); valid = false; }
    if (!lastName) { showError('lastName', 'lastNameError', 'Last name is required.'); valid = false; }
    if (!email) { showError('regEmail', 'regEmailError', 'Email is required.'); valid = false; }
    else if (!validateEmail(email)) { showError('regEmail', 'regEmailError', 'Enter a valid email.'); valid = false; }
    if (!phone || !/^\d{10}$/.test(phone)) { showError('phone', 'phoneError', 'Enter a valid 10-digit number.'); valid = false; }
    if (!password || password.length < 8) { showError('regPassword', 'regPasswordError', 'Password must be at least 8 characters.'); valid = false; }
    if (!college) { showError('college', 'collegeError', 'College name is required.'); valid = false; }
    if (!branch) { showError('branch', 'branchError', 'Please select your branch.'); valid = false; }
    if (!year) { showError('year', 'yearError', 'Please select your year.'); valid = false; }
    if (!cgpa || isNaN(cgpa) || cgpa < 0 || cgpa > 10) { showError('cgpa', 'cgpaError', 'Enter a valid CGPA (0–10).'); valid = false; }
    if (!gradYear) { showError('graduationYear', 'graduationYearError', 'Please select graduation year.'); valid = false; }
    if (!skills) { document.getElementById('skillsError').textContent = 'Add at least one skill.'; valid = false; }
    if (!companies) { document.getElementById('companiesError').textContent = 'Add at least one target company.'; valid = false; }
    if (!terms) { document.getElementById('termsError').textContent = 'You must accept the terms.'; valid = false; }

    if (!valid) return;

    const btn = document.getElementById('registerBtn');
    btn.textContent = 'Creating account...';
    btn.disabled = true;

    try {
        const response = await fetch(`${window.API_BASE || 'http://localhost:4000'}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName, lastName, email, phone, password,
                college, branch, year,
                cgpa: parseFloat(cgpa),
                graduationYear: parseInt(gradYear),
                skills: skills.split(',').filter(Boolean),
                targetCompanies: companies.split(',').filter(Boolean),
                linkedin: document.getElementById('linkedin').value.trim(),
                github: document.getElementById('github').value.trim(),
            })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('nextern_token', data.token);
            localStorage.setItem('nextern_name', data.user.firstName + ' ' + data.user.lastName);
            localStorage.setItem('nextern_user', JSON.stringify(data.user));

            // Show success then redirect
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('successState').classList.add('show');
            setTimeout(() => { window.location.href = '/pages/feed.html'; }, 2000);

        } else {
            showError('regEmail', 'regEmailError', data.message || 'Registration failed.');
            btn.textContent = 'Create Account';
            btn.disabled = false;
        }

    } catch (error) {
        showError('regEmail', 'regEmailError', 'Could not connect to server. Is it running on port 4000?');
        btn.textContent = 'Create Account';
        btn.disabled = false;
    }
}

/* ── GOOGLE AUTH ── */
function handleGoogleAuth() {
    window.location.href = `${window.API_BASE || 'http://localhost:4000'}/api/auth/google`;
}

/* ── CLEAR ERRORS ON TYPE ── */
function initClearErrors() {
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', function () {
            this.classList.remove('error');
            const group = this.closest('.form-group');
            if (group) {
                const err = group.querySelector('.field-error');
                if (err) err.textContent = '';
            }
        });
    });
}

/* ── INIT ── */
initTagInput('skillInput', 'skillTagWrap', 'skillsHidden', 'skills');
initTagInput('companyInput', 'companyTagWrap', 'companiesHidden', 'companies');
initPasswordStrength();
initClearErrors();
