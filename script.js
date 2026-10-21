/* ============================================================
   AETHERION.IO — Script
   ============================================================ */

/* ── Particle System ─────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLORS = [
    'rgba(232, 101, 10, ',
    'rgba(245, 166, 35, ',
    'rgba(255, 140, 0, ',
    'rgba(255, 180, 80, ',
    'rgba(255, 220, 120, ',
  ];

  let W, H, particles;

  // Wie in het systeem "minder beweging" heeft ingesteld, krijgt een stilstaand beeld
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function createParticle() {
    const colorBase = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size = rand(1, 4.5);
    const isLarge = size > 3;
    return {
      x: rand(0, W),
      y: rand(H * 0.2, H),
      size,
      colorBase,
      alpha: rand(0.2, isLarge ? 0.7 : 0.5),
      vx: rand(-0.25, 0.25),
      vy: rand(-0.6, -0.15),
      life: 1,
      decay: rand(0.0012, 0.003),
      twinkleSpeed: rand(0.01, 0.025),
      twinklePhase: rand(0, Math.PI * 2),
    };
  }

  function initParticles(count) {
    particles = [];
    for (let i = 0; i < count; i++) {
      const p = createParticle();
      p.y = rand(0, H);
      particles.push(p);
    }
  }

  let tick = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    tick++;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      p.x  += p.vx;
      p.y  += p.vy;
      p.life -= p.decay;
      p.twinklePhase += p.twinkleSpeed;

      const twinkle = 0.6 + 0.4 * Math.sin(p.twinklePhase);
      const alpha   = p.alpha * p.life * twinkle;

      if (p.life <= 0 || p.y < -10 || p.x < -10 || p.x > W + 10) {
        particles[i] = createParticle();
        continue;
      }

      if (p.size > 2.8) {
        ctx.shadowBlur  = 12;
        ctx.shadowColor = p.colorBase + '0.8)';
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.colorBase + alpha + ')';
      ctx.fill();
      ctx.shadowBlur = 0;

      if (p.size > 3.5) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = p.colorBase + (alpha * 0.12) + ')';
        ctx.fill();
      }
    }

    if (!reduceMotion) requestAnimationFrame(draw);
  }

  function getCount() {
    return W < 600 ? 55 : W < 1024 ? 90 : 130;
  }

  window.addEventListener('resize', () => {
    resize();
    initParticles(getCount());
    if (reduceMotion) draw();
  });

  resize();
  initParticles(getCount());
  draw();
})();


/* ── Nav Scroll ──────────────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
    });
  });
})();


/* ── Scroll Reveal ───────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!els.length) return;

  const staggerParents = new Map();

  els.forEach(el => {
    if (el.classList.contains('reveal-stagger')) {
      const parent = el.parentElement;
      if (!staggerParents.has(parent)) staggerParents.set(parent, []);
      staggerParents.get(parent).push(el);
    }
  });

  staggerParents.forEach(children => {
    children.forEach((el, i) => {
      el.style.transitionDelay = (i * 0.1) + 's';
    });
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
})();


/* ── Stat Counter ────────────────────────────────────────── */
(function initCounters() {
  const nums = document.querySelectorAll('.stat-num[data-target]');
  if (!nums.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseInt(el.dataset.target, 10);
      const dur    = 1200;
      const start  = performance.now();

      function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(ease * target);
        if (t < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  nums.forEach(el => io.observe(el));
})();


/* ── Active Nav Link ─────────────────────────────────────── */
(function initActiveLink() {
  const sections = document.querySelectorAll('section[id], .cta-section[id]');
  const links    = document.querySelectorAll('.nav-link');
  if (!sections.length || !links.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      links.forEach(l => {
        const href = l.getAttribute('href');
        l.style.color = href === '#' + id ? 'var(--accent2)' : '';
      });
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));
})();
