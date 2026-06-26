/* Refutures AI — Main Website */

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initNav();
  initReveal();
  initCounters();
  initDistBars();
  initRoadmap();
  initParticles();
  initTilt();
});

function initLoader() {
  const loader = document.getElementById('loader');
  const finish = () => {
    loader?.classList.add('hidden');
    document.body.classList.add('ready');
    document.querySelectorAll('.anim, .anim-scale').forEach(el => {
      const delay = parseInt(el.dataset.delay || 0, 10) * 100;
      setTimeout(() => el.classList.add('visible'), delay);
    });
  };
  window.addEventListener('load', () => setTimeout(finish, 1400));
  if (document.readyState === 'complete') setTimeout(finish, 1400);
}

function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.querySelectorAll('.nav-link[data-section]');
  const sections = [];

  links.forEach(link => {
    const id = link.dataset.section;
    const el = document.getElementById(id);
    if (el) sections.push({ id, el, link });
  });

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
    let current = sections[0]?.id;
    sections.forEach(({ id, el }) => {
      if (el.getBoundingClientRect().top <= 120) current = id;
    });
    links.forEach(l => l.classList.toggle('active', l.dataset.section === current));
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toggle?.addEventListener('click', () => nav.classList.toggle('open'));
  document.querySelectorAll('.nav-link, .footer-nav a').forEach(a => {
    a.addEventListener('click', () => nav.classList.remove('open'));
  });
}

function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      if (entry.target.classList.contains('reveal-group')) {
        entry.target.querySelectorAll('.reveal-child').forEach((child, i) => {
          child.style.transitionDelay = `${i * 100}ms`;
          child.classList.add('visible');
        });
      }
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal, .reveal-group').forEach(el => observer.observe(el));
}

function initCounters() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const format = el.dataset.format;
      const duration = 2000;
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / duration, 1);
        const val = Math.floor(target * (1 - Math.pow(1 - p, 3)));
        el.textContent = format === 'supply' ? val.toLocaleString('en-US') : String(val);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = format === 'supply' ? target.toLocaleString('en-US') : String(target);
      };
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
}

function initDistBars() {
  const card = document.querySelector('.dist-card');
  if (!card) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.dist-fill').forEach((bar, i) => {
        setTimeout(() => { bar.style.width = bar.dataset.w + '%'; }, i * 180);
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  observer.observe(card);
}

function initRoadmap() {
  const roadmap = document.querySelector('.roadmap');
  const progress = document.getElementById('roadProgress');
  if (!roadmap || !progress) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      progress.style.height = '35%';
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });
  observer.observe(roadmap);
}

function initTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  const aboutCard = document.querySelector('.tilt-card');
  if (aboutCard) {
    aboutCard.addEventListener('mousemove', e => {
      const rect = aboutCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      aboutCard.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });
    aboutCard.addEventListener('mouseleave', () => { aboutCard.style.transform = ''; });
  }
}

function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: -9999, y: -9999 };

  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  const create = () => {
    const n = Math.min(50, Math.floor(window.innerWidth / 26));
    particles = Array.from({ length: n }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 1.5 + 0.3, a: Math.random() * 0.3 + 0.05,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 120) { p.vx += dx * 0.00003; p.vy += dy * 0.00003; }
      p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.vy *= 0.99;
      if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(161,0,126,${p.a})`; ctx.fill();
    });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(161,0,126,${0.05 * (1 - d / 110)})`;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  };

  resize(); create(); draw();
  window.addEventListener('resize', () => { resize(); create(); });
  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
}
