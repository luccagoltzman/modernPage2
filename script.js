/* =============================================
   ESPHERA — SCRIPT.JS
   Animations, Scroll Reveal, Counters, Nav
   ============================================= */

(function () {
  'use strict';

  /* ─── NAVBAR SCROLL ─── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  /* ─── HAMBURGER MENU ─── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    navLinks.classList.contains('open')
      ? openHamburger(spans)
      : closeHamburger(spans);
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      closeHamburger(hamburger.querySelectorAll('span'));
    });
  });

  function openHamburger(spans) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  }
  function closeHamburger(spans) {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }

  /* ─── SCROLL REVEAL ─── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach((el, i) => {
    // Stagger siblings within the same parent
    const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
    const idx = siblings.indexOf(el);
    el.dataset.delay = idx * 90;
    revealObserver.observe(el);
  });

  /* ─── COUNTER ANIMATION ─── */
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter, .stat-value[data-target]').forEach(el => {
    counterObserver.observe(el);
  });

  /* ─── HERO PARTICLES ─── */
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
  const particlesContainer = document.getElementById('hero-particles');
  if (particlesContainer) {
    particlesContainer.appendChild(canvas);
    initParticles(canvas);
  }

  function initParticles(canvas) {
    const ctx = canvas.getContext('2d');
    let W = canvas.width  = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;

    const NUM = 55;
    const particles = Array.from({ length: NUM }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const CONNECT_DIST = 130;

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const opacity = (1 - dist / CONNECT_DIST) * 0.18;
            ctx.strokeStyle = `rgba(59,130,246,${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96,165,250,${p.alpha})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
      });

      requestAnimationFrame(draw);
    }

    draw();

    window.addEventListener('resize', () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }, { passive: true });
  }

  /* ─── CONTACT FORM ─── */
  const form = document.getElementById('contato-form');
  const successMsg = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('submit-btn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

      // Simulate async submission
      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> Enviado!';
        successMsg.classList.add('show');
        form.reset();

        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = 'Enviar mensagem <i class="fas fa-paper-plane"></i>';
          successMsg.classList.remove('show');
        }, 4000);
      }, 1500);
    });
  }

  /* ─── SMOOTH ACTIVE NAV ─── */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link');

  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => {
          a.classList.toggle(
            'active',
            a.getAttribute('href') === '#' + entry.target.id
          );
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => activeObserver.observe(s));

  /* ─── LOGO GLOW ON SCROLL ─── */
  const logoSphere = document.querySelector('.logo-sphere');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const intensity = Math.min(scrolled / 300, 1);
        if (logoSphere) {
          logoSphere.style.boxShadow = `0 0 ${14 + intensity * 20}px rgba(59,130,246,${0.35 + intensity * 0.3})`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

})();
