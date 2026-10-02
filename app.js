/**
 * Jackson Konur — site scripts (shared by every page)
 * - Mobile navigation toggle
 * - Scroll-in reveal animations
 * - Subtle particle background on the homepage
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initReveal();
  initParticles();
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Mobile menu: opens and closes the nav below 720px wide */
function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '✕' : '☰';
  });

  // Close the menu after picking a link
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
    });
  });
}

/* Fade sections in as they scroll into view */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((el) => observer.observe(el));
}

/* Drifting particle network behind the homepage (kept from the original zero-gravity design) */
function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let particles = [];
  const mouse = { x: 0, y: 0, active: false, radius: 140 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const count = Math.min(Math.floor((width * height) / 16000), 80);
    particles = Array.from({ length: count }, () => makeParticle(true));
  }

  function makeParticle(initial) {
    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + 10,
      r: Math.random() * 1.8 + 0.6,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.3 + 0.1),
      hue: Math.random() > 0.4 ? 188 : 258,
      alpha: Math.random() * 0.5 + 0.2,
    };
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });
  window.addEventListener('mouseleave', () => (mouse.active = false));

  function step() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p, i) => {
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x += (dx / dist) * force * 2;
          p.y += (dy / dist) * force * 2;
        }
      }

      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) particles[i] = makeParticle(false);
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 90%, 68%, ${p.alpha})`;
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(167, 139, 250, ${(1 - dist / 120) * 0.15})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  }

  resize();
  step();
}
