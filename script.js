(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile navigation: keyboard and screen-reader friendly.
  const menuToggle = $('#menuToggle');
  const navLinks = $('#navLinks');
  if (menuToggle && navLinks) {
    const closeMenu = () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation menu');
    };
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    });
    $$('a', navLinks).forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  // Scroll reveal, with a no-JS/reduced-motion-safe fallback.
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('visible'));
  }

  // Active navigation state.
  const sections = $$('main section[id]');
  const navAnchors = $$('.nav-links a[href^="#"]');
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Reading progress and compact header on scroll.
  const progress = $('#scrollProgress');
  const header = $('.site-header');
  let scrollQueued = false;
  const updateScrollUI = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percent = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    if (progress) progress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    if (header) header.classList.toggle('scrolled', window.scrollY > 16);
    scrollQueued = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollQueued) {
      window.requestAnimationFrame(updateScrollUI);
      scrollQueued = true;
    }
  }, { passive: true });
  updateScrollUI();

  // Animate chart bars only when the visualization enters view.
  const chartPanels = $$('.insight-panel');
  const animateCharts = panel => {
    panel.classList.add('chart-active');
    $$('.stack-fill', panel).forEach(bar => {
      const width = bar.dataset.width || '0%';
      bar.style.setProperty('--bar-width', width);
      bar.style.width = width;
    });
  };
  if ('IntersectionObserver' in window && !reduceMotion) {
    const chartObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCharts(entry.target);
          chartObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    chartPanels.forEach(panel => chartObserver.observe(panel));
  } else {
    chartPanels.forEach(animateCharts);
  }

  // Gentle pointer glow for skill cards; no movement on touch devices.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.skill-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        card.style.setProperty('--my', `${event.clientY - rect.top}px`);
      }, { passive: true });
    });
  }

  // Light particle field on canvas, capped for performance and disabled for reduced motion.
  const canvas = $('#particleCanvas');
  if (canvas && !reduceMotion && !window.matchMedia('(max-width: 700px)').matches) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      let width = 0, height = 0, particles = [], rafId = 0;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.min(55, Math.max(22, Math.floor(width / 26)));
        particles = Array.from({ length: count }, () => ({
          x: Math.random() * width, y: Math.random() * height,
          vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
          r: Math.random() * 1.4 + .35
        }));
      };
      const draw = () => {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(105, 225, 211, .48)';
          ctx.fill();
          for (let j = i + 1; j < particles.length; j++) {
            const q = particles[j];
            const dx = p.x - q.x, dy = p.y - q.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 105) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
              ctx.strokeStyle = `rgba(105, 225, 211, ${.075 * (1 - dist / 105)})`;
              ctx.lineWidth = .6;
              ctx.stroke();
            }
          }
        }
        rafId = window.requestAnimationFrame(draw);
      };
      resize();
      draw();
      window.addEventListener('resize', () => {
        window.cancelAnimationFrame(rafId);
        resize();
        draw();
      }, { passive: true });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) window.cancelAnimationFrame(rafId);
        else if (!reduceMotion) draw();
      });
    }
  }

  // Footer year.
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Contact details: config file is optional; avoid errors if a link is missing.
  fetch('data/site-config.json')
    .then(response => response.ok ? response.json() : Promise.reject(new Error('Config unavailable')))
    .then(config => {
      if (config.email && !config.email.includes('YOUR_EMAIL')) {
        const emailLink = $('[data-contact-email]');
        const emailLabel = $('[data-email-label]');
        if (emailLink) emailLink.href = `mailto:${config.email}`;
        if (emailLabel) emailLabel.textContent = config.email;
      }
      const linkedinLink = $('[data-linkedin-link]');
      const linkedinLabel = $('[data-linkedin-label]');
      if (config.linkedin && config.linkedin.startsWith('https://')) {
        if (linkedinLink) {
          linkedinLink.href = config.linkedin;
          linkedinLink.target = '_blank';
          linkedinLink.rel = 'noopener noreferrer';
          linkedinLink.removeAttribute('aria-disabled');
        }
        if (linkedinLabel) linkedinLabel.textContent = 'View LinkedIn profile';
      } else if (linkedinLink) {
        linkedinLink.addEventListener('click', event => event.preventDefault());
        linkedinLink.setAttribute('aria-disabled', 'true');
        linkedinLink.style.opacity = '.7';
      }
    })
    .catch(() => {
      const linkedinLink = $('[data-linkedin-link]');
      if (linkedinLink) {
        linkedinLink.addEventListener('click', event => event.preventDefault());
        linkedinLink.setAttribute('aria-disabled', 'true');
      }
    });
})();
