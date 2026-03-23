/* ================================================================
   NEXTERN — script.js

   JS TIP: This file runs AFTER the HTML loads (we placed the
   <script> tag at the bottom of <body>). That means we can
   safely query DOM elements without waiting for DOMContentLoaded.

   We use three key browser APIs here:
   1. IntersectionObserver  — detect when elements are on screen
   2. requestAnimationFrame — smooth counter animation
   3. addEventListener      — respond to user actions
================================================================ */


/* ----------------------------------------------------------------
   1. SCROLL REVEAL
   
   IntersectionObserver watches elements and fires a callback
   when they enter or leave the viewport. Much better than
   listening to the scroll event (which fires hundreds of times).
   
   How it works:
   - We select all elements with class .reveal
   - When one enters the viewport, we add .visible to it
   - CSS handles the actual fade-up animation (opacity + transform)
   - Once visible, we stop observing that element (no need to watch)
---------------------------------------------------------------- */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');

    // threshold: 0.12 means "fire when 12% of the element is visible"
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // stop watching once shown
                }
            });
        },
        { threshold: 0.12 }
    );

    revealElements.forEach((el) => observer.observe(el));
}


/* ----------------------------------------------------------------
   2. COUNTER ANIMATION
   
   The stat numbers in the hero (2400+, 380+, etc.) count up
   from 0 when they scroll into view. This is called an "odometer"
   or "countup" effect.
   
   requestAnimationFrame (rAF) is the right way to animate in JS.
   It syncs with the browser's paint cycle (~60fps) and pauses
   automatically when the tab is not visible.
   
   Easing formula: eased = 1 - (1 - progress)^3
   This is a cubic ease-out — starts fast, slows at the end.
---------------------------------------------------------------- */
function animateCounter(element, target, suffix) {
    let startTime = null;
    const DURATION = 1800; // milliseconds

    function tick(currentTime) {
        if (!startTime) startTime = currentTime;

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / DURATION, 1); // clamp 0 to 1

        // Cubic ease-out: decelerates toward the end
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);

        element.textContent = current.toLocaleString('en-IN') + suffix;

        if (progress < 1) {
            requestAnimationFrame(tick); // keep going
        } else {
            element.textContent = target.toLocaleString('en-IN') + suffix; // snap to final
        }
    }

    requestAnimationFrame(tick);
}

function initCounters() {
    const counters = document.querySelectorAll('.stat-number');

    // Watch the stats section — start counting when it appears
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    counters.forEach((counter) => {
                        const target = parseInt(counter.dataset.target, 10);
                        const suffix = counter.dataset.suffix || '';
                        animateCounter(counter, target, suffix);
                    });
                    observer.disconnect(); // only run once
                }
            });
        },
        { threshold: 0.5 }
    );

    // Observe the parent .hero-stats container
    const statsContainer = document.querySelector('.hero-stats');
    if (statsContainer) observer.observe(statsContainer);
}


/* ----------------------------------------------------------------
   3. PROGRESS BAR ANIMATION
   
   The roadmap widget has a progress bar (.rw-fill).
   Its target width is stored in data-width="42".
   We animate it when it scrolls into view.
   
   CSS handles the smooth transition (transition: width 1.2s ease)
   — JS just sets the final width value.
---------------------------------------------------------------- */
function initProgressBar() {
    const fill = document.querySelector('.rw-fill');
    if (!fill) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const targetWidth = fill.dataset.width;
                    fill.style.width = targetWidth + '%';
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    observer.observe(fill);
}


/* ----------------------------------------------------------------
   4. STICKY NAV SHADOW
   
   The navbar gets a stronger shadow once you scroll down.
   A simple scroll listener on window is fine for this since
   it's just toggling a class, not doing heavy work.
---------------------------------------------------------------- */
function initNavScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 2px 30px rgba(0,0,0,0.1)';
            navbar.style.borderBottomColor = '#D1D5DB';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.borderBottomColor = '#E5E7EB';
        }
    }, { passive: true }); // passive: true = performance hint (no preventDefault)
}


/* ----------------------------------------------------------------
   5. ACTIVE NAV LINK HIGHLIGHT
   
   Uses IntersectionObserver on each section.
   When a section is in view, we highlight the matching nav link.
   
   This is how single-page "scrollspy" navigation works.
---------------------------------------------------------------- */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Remove active from all links
                    navLinks.forEach((link) => link.style.color = '');
                    // Highlight the matching one
                    const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
                    if (active) active.style.color = '#4F46E5';
                }
            });
        },
        {
            // rootMargin shifts the "trigger zone" — fires when section is near top
            rootMargin: '-40% 0px -55% 0px'
        }
    );

    sections.forEach((section) => observer.observe(section));
}


/* ----------------------------------------------------------------
   6. EARLY ACCESS FORM
   
   The form at the bottom collects email.
   For now we just validate and show a thank-you message.
   Later you'll wire this to your backend API (POST /api/waitlist).
---------------------------------------------------------------- */
function handleSignup(event) {
    event.preventDefault(); // stop the page from refreshing (default form behaviour)

    const form = event.target;
    const input = form.querySelector('.email-input');
    const email = input.value.trim();

    // Basic validation — HTML "required" handles empty, but let's check domain
    if (!email.includes('@')) {
        showFormMessage(form, 'Please enter a valid email.', false);
        return;
    }

    // TODO: Replace this with a real fetch() call to your backend
    // fetch('/api/waitlist', { method: 'POST', body: JSON.stringify({ email }) })

    // Simulate success for now
    showFormMessage(form, `🎉 You're on the list! We'll reach out to ${email} soon.`, true);
    input.value = '';
}

function showFormMessage(form, message, isSuccess) {
    // Remove any existing message
    const existing = form.parentElement.querySelector('.form-message');
    if (existing) existing.remove();

    const msg = document.createElement('p');
    msg.className = 'form-message';
    msg.textContent = message;
    msg.style.cssText = `
    font-size: 0.85rem;
    margin-top: 14px;
    color: ${isSuccess ? '#16A34A' : '#DC2626'};
    animation: fadeUp 0.4s ease both;
  `;
    form.parentElement.appendChild(msg);

    // Auto-remove after 5 seconds
    setTimeout(() => msg.remove(), 5000);
}


/* ----------------------------------------------------------------
   7. SMOOTH ANCHOR SCROLLING WITH OFFSET
   
   The navbar is fixed (60px tall), so clicking anchor links
   would scroll the section title under the navbar.
   We intercept clicks and offset the scroll by navbar height.
---------------------------------------------------------------- */
function initSmoothScroll() {
    const NAVBAR_HEIGHT = 72;

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return; // skip logo link

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();

            const top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
}


/* ----------------------------------------------------------------
   8. COMPANY CHIP HOVER RIPPLE
   
   Small touch — clicking a company chip briefly highlights it.
   This is done by adding/removing a class, letting CSS animate.
---------------------------------------------------------------- */
function initCompanyChips() {
    document.querySelectorAll('.company-list span').forEach((chip) => {
        chip.addEventListener('click', function () {
            this.style.background = 'rgba(79, 70, 229, 0.1)';
            this.style.borderColor = '#4F46E5';
            this.style.color = '#4F46E5';
            setTimeout(() => {
                this.style.background = '';
                this.style.borderColor = '';
                this.style.color = '';
            }, 600);
        });
    });
}


/* ----------------------------------------------------------------
   INIT — Run everything when the page loads
   
   We call each function once. Keeping them separate makes it easy
   to debug — if counters break, you know it's in initCounters().
---------------------------------------------------------------- */
function init() {
    initScrollReveal();
    initCounters();
    initProgressBar();
    initNavScroll();
    initScrollSpy();
    initSmoothScroll();
    initCompanyChips();
}

init();

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(item => {
    item.addEventListener("click", () => {
        item.classList.toggle("active");
    });
});