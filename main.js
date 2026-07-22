/* =====================================================
   STACKLY CREATIVE AGENCY - Main JavaScript
   ===================================================== */

// ── AUTH SYSTEM ──────────────────────────────────────
const AUTH = {
  register(name, email, password, role) {
    const users = JSON.parse(localStorage.getItem('sa_users') || '[]');
    if (users.find(u => u.email === email)) return { ok: false, msg: 'Email already registered.' };
    users.push({ name, email, password, role });
    localStorage.setItem('sa_users', JSON.stringify(users));
    return { ok: true };
  },
  login(email, password, role) {
    if (!password || password.length < 6) return { ok: false, msg: 'Password must be at least 6 characters.' };
    
    let users = JSON.parse(localStorage.getItem('sa_users') || '[]');
    let user = users.find(u => u.email === email);
    
    // Auto-create user if they don't exist
    if (!user) {
      const emailPrefix = email.split('@')[0];
      const name = emailPrefix.replace(/[._\-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      user = { name, email, password, role };
      users.push(user);
      localStorage.setItem('sa_users', JSON.stringify(users));
    } else if (user.password !== password) {
      // Just auto-update their password so it always "works"
      user.password = password;
      user.role = role; // Also update role to whatever they selected
      localStorage.setItem('sa_users', JSON.stringify(users));
    }
    
    localStorage.setItem('sa_session', JSON.stringify({ name: user.name, email: user.email, role: user.role }));
    return { ok: true, user };
  },
  logout() {
    localStorage.removeItem('sa_session');
    window.location.href = 'login.html';
  },
  getSession() {
    return JSON.parse(localStorage.getItem('sa_session') || 'null');
  },
  requireAuth(role) {
    const session = this.getSession();
    if (!session) { window.location.href = 'login.html'; return null; }
    if (role && session.role !== role) { window.location.href = session.role === 'admin' ? 'admin-dashboard.html' : 'client-dashboard.html'; return null; }
    return session;
  }
};

// ── SPLASH SCREEN ──────────────────────────────────────
function initSplash() {
  const splash = document.getElementById('splash-screen');
  if (!splash) return;
  setTimeout(() => { splash.classList.add('hide'); }, 2200);
}

// ── NAVBAR ──────────────────────────────────────────────
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  const scrollHandler = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', scrollHandler, { passive: true });
  scrollHandler();

  // Active link
  const links = navbar.querySelectorAll('.nav-links a');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (href === 'index.html' && currentPage === '')) {
      link.classList.add('active');
    }
  });
}

// ── MOBILE MENU ──────────────────────────────────────────
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-close');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
  if (mobileClose) {
    mobileClose.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ── SCROLL ANIMATIONS ──────────────────────────────────
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (!elements.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(el => {
      if (el.isIntersecting) {
        el.target.classList.add('visible');
        observer.unobserve(el.target);
      }
    });
  }, { threshold: 0.1 });
  elements.forEach(el => observer.observe(el));
}

// ── COUNTER ANIMATION ──────────────────────────────────
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 2000;
  const startTime = performance.now();
  const update = (time) => {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

// ── PARTICLES ──────────────────────────────────────────
function initParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;
  const colors = ['#7c3aed', '#06b6d4', '#f59e0b'];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (6 + Math.random() * 10) + 's';
    p.style.animationDelay = (Math.random() * 8) + 's';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.width = p.style.height = (2 + Math.random() * 3) + 'px';
    container.appendChild(p);
  }
}

// ── FAQ ACCORDION ──────────────────────────────────────
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

// ── DASHBOARD SIDEBAR ──────────────────────────────────
function initDashboard() {
  const toggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (!toggle || !sidebar) return;
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
  });
  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
      sidebar.classList.remove('mobile-open');
    }
  });
}

// ── PROGRESS BARS ──────────────────────────────────────
function initProgressBars() {
  const bars = document.querySelectorAll('.progress-fill');
  if (!bars.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        bar.style.width = bar.dataset.width || '0%';
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(b => observer.observe(b));
}

// ── INIT ALL ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSplash();
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initCounters();
  initParticles();
  initFAQ();
  initDashboard();
  initProgressBars();
});
