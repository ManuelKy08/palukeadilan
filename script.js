/* ─────────────────────────────────────────
   script.js — Palukeadilan News
   ───────────────────────────────────────── */

/* ══════════════════════════════════════════
   1. PARTICLE + BACKGROUND ANIMATION
══════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;

  /* Resize canvas to fill viewport */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Particle class ── */
  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x     = Math.random() * W;
      this.y     = initial ? Math.random() * H : (Math.random() > 0.5 ? -5 : H + 5);
      this.vx    = (Math.random() - 0.5) * 0.28;
      this.vy    = (Math.random() - 0.5) * 0.28;
      this.r     = Math.random() * 1.1 + 0.3;
      this.alpha = Math.random() * 0.45 + 0.08;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      /* Wrap or respawn */
      if (this.x < -10 || this.x > W + 10 ||
          this.y < -10 || this.y > H + 10) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232, 200, 74, ${this.alpha})`;
      ctx.fill();
    }
  }

  /* ── Create particles (fewer on mobile for perf) ── */
  const COUNT = window.innerWidth < 560 ? 45 : 80;
  const particles = Array.from({ length: COUNT }, () => new Particle());

  /* ── Draw connection lines between nearby particles ── */
  function drawConnections() {
    const maxDist = window.innerWidth < 560 ? 90 : 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.11;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(232, 200, 74, ${alpha})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  /* ── Soft radial gradient orbs in background ── */
  function drawOrbs() {
    const g1 = ctx.createRadialGradient(
      W * 0.14, H * 0.22, 0,
      W * 0.14, H * 0.22, W * 0.28
    );
    g1.addColorStop(0, 'rgba(232,200,74,0.045)');
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    const g2 = ctx.createRadialGradient(
      W * 0.86, H * 0.72, 0,
      W * 0.86, H * 0.72, W * 0.24
    );
    g2.addColorStop(0, 'rgba(255,78,78,0.03)');
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);
  }

  /* ── Main animation loop ── */
  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawOrbs();
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(loop);
  }
  loop();
})();


/* ══════════════════════════════════════════
   2. READ PROGRESS BAR
══════════════════════════════════════════ */
(function () {
  const bar = document.getElementById('readProgress');
  if (!bar) return;

  function updateProgress() {
    const doc    = document.documentElement;
    const scroll = doc.scrollTop || document.body.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const pct    = height > 0 ? (scroll / height) * 100 : 0;
    bar.style.width = pct + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
})();


/* ══════════════════════════════════════════
   3. SHARE BUTTONS
══════════════════════════════════════════ */
(function () {
  const ARTICLE_TITLE = 'THL UPTD Capil Soroti Ketimpangan Gaji, Ini Penjelasan Dinas Dukcapil Pekanbaru';
  const ARTICLE_URL   = 'https://www.palukeadilannews.com/2025/05/thl-uptd-disdukcapil-pekanbaru-keluhkan.html';

  const encTitle = encodeURIComponent(ARTICLE_TITLE);
  const encURL   = encodeURIComponent(ARTICLE_URL);

  const waBtn = document.getElementById('shareWA');
  const xBtn  = document.getElementById('shareX');

  if (waBtn) waBtn.href = `https://wa.me/?text=${encTitle}%20${encURL}`;
  if (xBtn)  xBtn.href  = `https://twitter.com/intent/tweet?text=${encTitle}&url=${encURL}`;

  /* Expose copyLink globally so inline onclick works */
  window.copyLink = function () {
    const label = document.getElementById('copyLabel');
    navigator.clipboard.writeText(ARTICLE_URL)
      .then(() => {
        if (label) {
          label.textContent = 'Tersalin! ✓';
          setTimeout(() => { label.textContent = 'Salin Link'; }, 2200);
        }
      })
      .catch(() => {
        /* Fallback for older browsers */
        const ta = document.createElement('textarea');
        ta.value = ARTICLE_URL;
        ta.style.position = 'fixed';
        ta.style.opacity  = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        if (label) {
          label.textContent = 'Tersalin! ✓';
          setTimeout(() => { label.textContent = 'Salin Link'; }, 2200);
        }
      });
  };
})();


/* ══════════════════════════════════════════
   4. INTERSECTION OBSERVER — scroll reveal
   (for elements added after initial load)
══════════════════════════════════════════ */
(function () {
  if (!('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll(
    '.fact-box, .source-card, .pull-quote'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity    = '1';
        entry.target.style.transform  = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => {
    /* Set initial hidden state only if not already animated via CSS */
    el.style.opacity   = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    observer.observe(el);
  });
})();
