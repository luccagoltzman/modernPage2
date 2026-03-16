/* ============================================================
   ESPHERA — script.js v3
   Scroll nativo + GSAP ScrollTrigger + Three.js
   ============================================================ */

/* ══════════════════════════════════════════════════════════
   0.  GUARD — wait for libs
══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const mobile = () => window.innerWidth <= 820;

  /* ══════════════════════════════════════════════════════════
     1.  PAGE LOADER
  ══════════════════════════════════════════════════════════ */
  const loader    = document.getElementById('page-loader');
  const ldrFill   = document.getElementById('loader-bar-fill');
  const ldrLabel  = document.getElementById('loader-label');
  const labels    = ['Carregando...', 'Inicializando...', 'Quase lá...'];
  let   pct       = 0;

  const ldrTick = setInterval(() => {
    pct += Math.random() * 22;
    if (pct >= 100) { pct = 100; clearInterval(ldrTick); startApp(); }
    ldrFill.style.width = pct + '%';
    ldrLabel.textContent = labels[Math.min(2, Math.floor(pct / 34))];
  }, 90);

  function startApp() {
    setTimeout(() => {
      const cfg = window.APP_CONFIG || {};

      // Se modo "Em Breve" estiver ativo, mostra overlay e não inicializa interações pesadas
      if (cfg.comingSoon) {
        const cs      = document.getElementById('coming-soon');
        const csTitle = document.getElementById('cs-title');
        const csSub   = document.getElementById('cs-sub');
        const csCta   = document.getElementById('cs-cta');

        if (cs) {
          cs.classList.add('is-active');
          if (cfg.comingSoonTitle)   csTitle.textContent = cfg.comingSoonTitle;
          if (cfg.comingSoonSubtitle) csSub.textContent  = cfg.comingSoonSubtitle;
          if (cfg.comingSoonCTA)      csCta.firstChild.nodeValue = cfg.comingSoonCTA + ' ';
          if (cfg.comingSoonCtaHref)  csCta.href = cfg.comingSoonCtaHref;
        }

        loader.classList.add('away');
        document.body.classList.remove('is-loading');
        // Não chamamos animações/Three.js/etc para deixar leve
        return;
      }

      loader.classList.add('away');
      document.body.classList.remove('is-loading');
      bootHeroTimeline();
      bootCountersHero();
    }, 350);
  }

  /* ══════════════════════════════════════════════════════════
     2.  SCROLL NATIVO (controle total do usuário)
  ══════════════════════════════════════════════════════════ */

  /* ══════════════════════════════════════════════════════════
     3.  REGISTER SCROLLTRIGGER
  ══════════════════════════════════════════════════════════ */
  gsap.registerPlugin(ScrollTrigger);

  /* ══════════════════════════════════════════════════════════
     4.  SCROLL PROGRESS BAR
  ══════════════════════════════════════════════════════════ */
  const progBar = document.getElementById('scroll-progress');
  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progBar.style.width = progress + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  /* ══════════════════════════════════════════════════════════
     5.  NAVBAR SOLID ON SCROLL
  ══════════════════════════════════════════════════════════ */
  const nav = document.getElementById('nav');
  ScrollTrigger.create({
    start: 'top -60',
    onEnter:      () => nav.classList.add('solid'),
    onLeaveBack:  () => nav.classList.remove('solid'),
  });

  // Mobile hamburger
  const burger = document.getElementById('nav-burger');
  const mMenu  = document.getElementById('mobile-menu');
  burger.addEventListener('click', () => {
    const open = mMenu.classList.toggle('open');
    burger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mMenu.querySelectorAll('.mmlink').forEach(l => l.addEventListener('click', () => {
    mMenu.classList.remove('open'); burger.classList.remove('open');
    document.body.style.overflow = '';
  }));

  /* ══════════════════════════════════════════════════════════
     6.  CUSTOM CURSOR
  ══════════════════════════════════════════════════════════ */
  if (!mobile()) {
    const cursor = document.getElementById('cursor');
    let cx = 0, cy = 0;

    document.addEventListener('mousemove', e => {
      cx = e.clientX; cy = e.clientY;
      gsap.to(cursor, { left: cx, top: cy, duration: 0.55, ease: 'power3.out' });
    });

    document.querySelectorAll('a, button, .js-magnetic').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('lg'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('lg'));
    });

    document.querySelectorAll('input, select, textarea').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('sm'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('sm'));
    });
  }

  /* ══════════════════════════════════════════════════════════
     7.  MAGNETIC BUTTONS
  ══════════════════════════════════════════════════════════ */
  if (!mobile()) {
    document.querySelectorAll('.js-magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r  = el.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) * 0.38;
        const dy = (e.clientY - r.top  - r.height / 2) * 0.38;
        gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     8.  THREE.JS HERO PARTICLE NETWORK
  ══════════════════════════════════════════════════════════ */
  (function initThree() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const heroEl  = canvas.parentElement || canvas;
    const heroBox = heroEl.getBoundingClientRect();

    const scene    = new THREE.Scene();
    let   W        = heroBox.width;
    let   H        = heroBox.height;
    const camera   = new THREE.PerspectiveCamera(40, W / H, 0.1, 400);
    camera.position.z = 22;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);

    // --- Particles ---
    const COUNT = 90;
    const pos   = new Float32Array(COUNT * 3);
    const vel   = [];
    const sizes = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 38;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      vel.push({
        x: (Math.random() - 0.5) * 0.008,
        y: (Math.random() - 0.5) * 0.006,
      });
      sizes[i] = Math.random() > 0.85 ? 0.22 : 0.10;
    }

    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    ptGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const ptMat = new THREE.PointsMaterial({
      color: 0x3d7fff, size: 0.14, transparent: true,
      opacity: 0.7, sizeAttenuation: true,
    });

    const points = new THREE.Points(ptGeo, ptMat);
    scene.add(points);

    // --- Lines (pre-alloc max possible segments) ---
    const MAX_LINES  = COUNT * COUNT;
    const linePos    = new Float32Array(MAX_LINES * 6);
    const lineGeo    = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x3d7fff, transparent: true, opacity: 0.08,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // --- Pulse rings (GPS pins) ---
    const ringGeo = new THREE.RingGeometry(0.3, 0.35, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    const rings = [];
    for (let i = 0; i < 5; i++) {
      const m = new THREE.Mesh(ringGeo, ringMat.clone());
      m.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 4
      );
      scene.add(m);
      rings.push(m);
    }

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', e => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    const CONNECT_DIST = 9;
    let   t = 0;

    function animate() {
      requestAnimationFrame(animate);
      t += 0.004;

      // Move particles
      for (let i = 0; i < COUNT; i++) {
        pos[i * 3]     += vel[i].x;
        pos[i * 3 + 1] += vel[i].y;
        if (Math.abs(pos[i * 3])     > 19) vel[i].x *= -1;
        if (Math.abs(pos[i * 3 + 1]) > 11) vel[i].y *= -1;
      }
      ptGeo.attributes.position.needsUpdate = true;

      // Build connection lines
      let li = 0;
      for (let a = 0; a < COUNT; a++) {
        for (let b = a + 1; b < COUNT; b++) {
          const dx = pos[a * 3]     - pos[b * 3];
          const dy = pos[a * 3 + 1] - pos[b * 3 + 1];
          const dz = pos[a * 3 + 2] - pos[b * 3 + 2];
          const d  = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (d < CONNECT_DIST && li + 5 < MAX_LINES * 6) {
            linePos[li++] = pos[a * 3]; linePos[li++] = pos[a * 3 + 1]; linePos[li++] = pos[a * 3 + 2];
            linePos[li++] = pos[b * 3]; linePos[li++] = pos[b * 3 + 1]; linePos[li++] = pos[b * 3 + 2];
          }
        }
      }
      lineGeo.setDrawRange(0, li / 3);
      lineGeo.attributes.position.needsUpdate = true;

      // Pulse rings
      rings.forEach((r, i) => {
        const s = 1 + 0.4 * Math.sin(t * 1.8 + i * 1.2);
        r.scale.set(s, s, 1);
        r.material.opacity = 0.5 - 0.4 * Math.abs(Math.sin(t * 1.8 + i * 1.2));
      });

      // Subtle camera drift + mouse parallax
      camera.position.x = Math.sin(t * 0.15) * 1.4 + mouseX * 1.8;
      camera.position.y = Math.cos(t * 0.11) * 0.8 - mouseY * 1.2;

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      const box = heroEl.getBoundingClientRect();
      W = box.width; H = box.height;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    }, { passive: true });
  })();

  /* ══════════════════════════════════════════════════════════
     9.  HERO TIMELINE (GSAP)
  ══════════════════════════════════════════════════════════ */
  function bootHeroTimeline() {
    // Wrap h1 lines
    document.querySelectorAll('.h1-line').forEach(line => {
      const text = line.textContent;
      line.textContent = '';
      line.innerHTML = `<span class="h1-line-inner">${text}</span>`;
    });

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // Hero photo subtle scale
    tl.fromTo('.hero-photo', { scale: 1.08 }, { scale: 1, duration: 2.2, ease: 'power3.out' }, 0);

    // Tag line
    tl.fromTo('.hero-tag', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .7 }, 0.2);

    // H1 lines stagger (clip from bottom)
    tl.fromTo('.h1-line-inner',
      { yPercent: 110 },
      { yPercent: 0, duration: 1, stagger: 0.16 },
      0.4
    );

    // Sub, actions, kpis
    tl.fromTo('.hero-sub',     { opacity:0, y:22 }, { opacity:1, y:0, duration:.8 }, 1.0);
    tl.fromTo('.hero-actions', { opacity:0, y:22 }, { opacity:1, y:0, duration:.8 }, 1.16);
    tl.fromTo('.hero-kpis',    { opacity:0, y:22 }, { opacity:1, y:0, duration:.8 }, 1.3);
    tl.fromTo('.hero-scroll',  { opacity:0 },        { opacity:1, duration:.8 },       1.5);

    // Hero parallax on scroll
    if (!mobile()) {
      gsap.to('.hero-photo', {
        yPercent: 28,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 },
      });
    }

    // Fade scroll cue on scroll
    gsap.to('.hero-scroll', {
      opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: '20% top', end: '40% top', scrub: true },
    });
  }

  /* ══════════════════════════════════════════════════════════
     10. HERO COUNTERS
  ══════════════════════════════════════════════════════════ */
  function bootCountersHero() {
    document.querySelectorAll('.js-count-hero').forEach(el => {
      animCount(el, 1400);
    });
  }

  function animCount(el, delay = 0) {
    const target = +el.dataset.target;
    const dur    = 1800;
    setTimeout(() => {
      const start = performance.now();
      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    }, delay);
  }

  /* ══════════════════════════════════════════════════════════
     11. SPLIT TEXT HEADINGS
  ══════════════════════════════════════════════════════════ */
  function splitAndAnimate(el) {
    const html = el.innerHTML;
    // Wrap each text node line preserving <em> / <br>
    const lines = html.split(/<br\s*\/?>/i);
    el.innerHTML = lines.map(l => `<div class="line"><div class="line-inner">${l}</div></div>`).join('');

    gsap.fromTo(el.querySelectorAll('.line-inner'),
      { yPercent: 110 },
      {
        yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 86%', toggleActions: 'play none none none' },
      }
    );
  }

  document.querySelectorAll('.js-split-text').forEach(el => {
    // Don't double-apply to hero h1 (handled in bootHeroTimeline)
    if (!el.closest('.hero-content')) splitAndAnimate(el);
  });

  /* ══════════════════════════════════════════════════════════
     12. FADE-UP ELEMENTS
  ══════════════════════════════════════════════════════════ */
  gsap.utils.toArray('.js-fade-up').forEach(el => {
    if (el.closest('.hero-content')) return;
    gsap.fromTo(el,
      { opacity: 0, y: 38 },
      {
        opacity: 1, y: 0,
        duration: 0.9, ease: 'power3.out',
        delay: (el.dataset.delay || 0) / 1000,
        scrollTrigger: { trigger: el, start: 'top 87%', toggleActions: 'play none none none' },
      }
    );
  });

  /* ══════════════════════════════════════════════════════════
     13. IMAGE REVEAL (clip-path via GSAP)
  ══════════════════════════════════════════════════════════ */
  gsap.utils.toArray('.js-img-reveal').forEach(wrap => {
    const mask = wrap.querySelector('.img-reveal-mask');
    const img  = wrap.querySelector('img');

    gsap.set(img, { scale: 1.12 });
    gsap.to(mask, {
      scaleY: 0, transformOrigin: 'bottom',
      duration: 1.2, ease: 'power4.inOut',
      scrollTrigger: { trigger: wrap, start: 'top 78%', toggleActions: 'play none none none' },
    });
    gsap.to(img, {
      scale: 1, duration: 1.4, ease: 'power3.out',
      scrollTrigger: { trigger: wrap, start: 'top 78%', toggleActions: 'play none none none' },
    });
  });

  /* ══════════════════════════════════════════════════════════
     14. GSAP HORIZONTAL PIN — SERVICES
  ══════════════════════════════════════════════════════════ */
  if (!mobile()) {
    const pin   = document.getElementById('servicos-pin');
    const track = document.getElementById('svc-track');
    const progFill = document.getElementById('svc-prog-fill');
    const current  = document.getElementById('svc-current');

    ScrollTrigger.create({
      trigger: pin,
      start:   'top top',
      end:     () => '+=' + (track.scrollWidth - track.offsetWidth + 80),
      pin:     true,
      pinSpacing: true,
      scrub:   1,
      invalidateOnRefresh: true,
      animation: gsap.to(track, {
        x: () => -(track.scrollWidth - track.offsetWidth),
        ease: 'none',
      }),
      onUpdate(self) {
        const p = self.progress;
        progFill.style.width = (p * 100) + '%';
        const card = Math.min(6, Math.ceil(p * 6) || 1);
        current.textContent = String(card).padStart(2, '0');
      },
    });
  }

  /* ══════════════════════════════════════════════════════════
     15. PARALLAX — SHOWCASE + CTA
  ══════════════════════════════════════════════════════════ */
  if (!mobile()) {
    [
      { el: '#showcase-parallax', speed: 0.28 },
      { el: '#cta-par-bg',        speed: 0.24 },
    ].forEach(({ el, speed }) => {
      const target = document.querySelector(el);
      if (!target) return;
      gsap.to(target, {
        yPercent: speed * 60,
        ease: 'none',
        scrollTrigger: {
          trigger: target.closest('section') || target.parentElement,
          start: 'top bottom', end: 'bottom top',
          scrub: 1.4,
        },
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     16. COUNTERS — stats section
  ══════════════════════════════════════════════════════════ */
  document.querySelectorAll('.js-counter').forEach(el => {
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => animCount(el, 0),
    });
  });

  /* ══════════════════════════════════════════════════════════
     17. ABOUT FLOATING BADGES STAGGER
  ══════════════════════════════════════════════════════════ */
  gsap.fromTo(['.sobre-badge', '.sobre-float-card'],
    { opacity: 0, scale: 0.85, y: 12 },
    {
      opacity: 1, scale: 1, y: 0,
      duration: 0.8, ease: 'back.out(1.4)', stagger: 0.18,
      scrollTrigger: { trigger: '.sobre', start: 'top 72%', toggleActions: 'play none none none' },
    }
  );

  /* ══════════════════════════════════════════════════════════
     18. RESULT CARDS STAGGER
  ══════════════════════════════════════════════════════════ */
  gsap.fromTo('.res-card',
    { opacity: 0, y: 36 },
    {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: '.res-cards', start: 'top 82%', toggleActions: 'play none none none' },
    }
  );

  /* ══════════════════════════════════════════════════════════
     19. CONTACT FORM
  ══════════════════════════════════════════════════════════ */
  const form    = document.getElementById('contato-form');
  const formOk  = document.getElementById('form-ok');
  const formBtn = document.getElementById('form-btn');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      formBtn.disabled  = true;
      formBtn.innerHTML = '<span><i class="fas fa-spinner fa-spin"></i> Enviando...</span>';

      setTimeout(() => {
        formBtn.innerHTML = '<span><i class="fas fa-check"></i> Enviado!</span>';
        formOk.classList.add('show');
        form.reset();
        setTimeout(() => {
          formBtn.disabled  = false;
          formBtn.innerHTML = '<span>Enviar mensagem</span><i class="fas fa-arrow-right"></i>';
          formOk.classList.remove('show');
        }, 5000);
      }, 1800);
    });
  }

  /* ══════════════════════════════════════════════════════════
     20. ACTIVE NAV LINK
  ══════════════════════════════════════════════════════════ */
  document.querySelectorAll('section[id]').forEach(sec => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 48%', end: 'bottom 48%',
      onEnter:      () => highlightNav(sec.id),
      onEnterBack:  () => highlightNav(sec.id),
    });
  });
  function highlightNav(id) {
    document.querySelectorAll('.nav-link').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + id);
    });
  }

  /* ══════════════════════════════════════════════════════════
     21. REFRESH SCROLLTRIGGER AFTER LENIS SETUP
  ══════════════════════════════════════════════════════════ */
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });

})();
