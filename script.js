/* ============================================================
   ESPHERA — SCRIPT.JS v2  (Premium interactions)
   ============================================================ */
(function () {
  'use strict';

  /* ══════════════════════════════════════════
     0. GLOBALS
  ══════════════════════════════════════════ */
  const isMobile = () => window.innerWidth <= 768;

  /* ══════════════════════════════════════════
     1. PAGE LOADER
  ══════════════════════════════════════════ */
  const loader     = document.getElementById('page-loader');
  const loaderBar  = document.getElementById('loader-bar-fill');
  const loaderPct  = document.getElementById('loader-percent');

  let progress = 0;
  const ldrInterval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) { progress = 100; clearInterval(ldrInterval); finishLoader(); }
    loaderBar.style.width = progress + '%';
    loaderPct.textContent = Math.floor(progress) + '%';
  }, 80);

  function finishLoader() {
    setTimeout(() => {
      loader.classList.add('done');
      document.body.classList.remove('loading');
      initHeroReveal();
    }, 300);
  }

  /* ══════════════════════════════════════════
     2. CUSTOM CURSOR
  ══════════════════════════════════════════ */
  if (!isMobile()) {
    const cursor   = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    let mx = 0, my = 0, fx = 0, fy = 0;
    let rafCursor;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });

    function animateFollower() {
      fx += (mx - fx) * 0.1;
      fy += (my - fy) * 0.1;
      follower.style.left = fx + 'px';
      follower.style.top  = fy + 'px';
      rafCursor = requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Hover state on interactive elements
    document.querySelectorAll('a, button, [data-magnetic], input, select, textarea').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovered');
        follower.classList.add('hovered');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovered');
        follower.classList.remove('hovered');
      });
    });
  }

  /* ══════════════════════════════════════════
     3. MAGNETIC BUTTONS
  ══════════════════════════════════════════ */
  if (!isMobile()) {
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const rect   = el.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = (e.clientX - cx) * 0.35;
        const dy     = (e.clientY - cy) * 0.35;
        el.style.transform  = `translate(${dx}px, ${dy}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ══════════════════════════════════════════
     4. NAVBAR
  ══════════════════════════════════════════ */
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('nav-burger');
  const mMenu  = document.getElementById('mobile-menu');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  burger.addEventListener('click', () => {
    const isOpen = mMenu.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
  });

  mMenu.querySelectorAll('.mm-link').forEach(l => {
    l.addEventListener('click', () => {
      mMenu.classList.remove('open');
      burger.classList.remove('open');
    });
  });

  /* ══════════════════════════════════════════
     5. FILM GRAIN CANVAS
  ══════════════════════════════════════════ */
  const grainCanvas = document.getElementById('hero-grain');
  if (grainCanvas) {
    const gCtx = grainCanvas.getContext('2d');
    let gW, gH;

    function resizeGrain() {
      gW = grainCanvas.width  = window.innerWidth;
      gH = grainCanvas.height = window.innerHeight;
    }
    resizeGrain();
    window.addEventListener('resize', resizeGrain, { passive: true });

    function drawGrain() {
      const imageData = gCtx.createImageData(gW, gH);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255 | 0;
        data[i] = data[i+1] = data[i+2] = v;
        data[i+3] = 18;
      }
      gCtx.putImageData(imageData, 0, 0);
      setTimeout(drawGrain, 80);
    }
    drawGrain();
  }

  /* ══════════════════════════════════════════
     6. PARALLAX ON SCROLL
  ══════════════════════════════════════════ */
  const parallaxEls = [
    { el: document.getElementById('hero-parallax-bg'),    speed: 0.45 },
    { el: document.getElementById('showcase-parallax'),   speed: 0.3  },
    { el: document.getElementById('cta-parallax-bg'),     speed: 0.3  },
  ].filter(o => o.el);

  let lastScrollY = window.scrollY;
  let ticking = false;

  function applyParallax() {
    const sy = window.scrollY;
    parallaxEls.forEach(({ el, speed }) => {
      const rect = el.parentElement.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      const offset = sy * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!ticking) { requestAnimationFrame(applyParallax); ticking = true; }
  }, { passive: true });

  /* ══════════════════════════════════════════
     7. SPLIT TEXT — headings
  ══════════════════════════════════════════ */
  function splitHeading(el) {
    const text = el.textContent;
    el.textContent = '';
    el.style.overflow = 'hidden';

    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.transitionDelay = (i * 28) + 'ms';
      el.appendChild(span);
    });
  }

  document.querySelectorAll('[data-reveal="split"]').forEach(el => {
    splitHeading(el);
  });

  /* ══════════════════════════════════════════
     8. SCROLL REVEAL (IntersectionObserver)
  ══════════════════════════════════════════ */
  function initHeroReveal() {
    // Animate hero elements first
    document.querySelectorAll('.hero-content [data-reveal], .hero-content .split-line').forEach(el => {
      const delay = parseInt(el.dataset.delay || 0);
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }, delay);
    });
  }

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseInt(el.dataset.delay || 0);

      if (el.dataset.reveal === 'split') {
        setTimeout(() => {
          el.querySelectorAll('.char').forEach(c => c.classList.add('revealed'));
        }, delay);
      } else {
        setTimeout(() => {
          el.style.transition = 'opacity .8s cubic-bezier(.22,1,.36,1), transform .8s cubic-bezier(.22,1,.36,1)';
          el.style.transitionDelay = delay + 'ms';
          el.style.opacity  = '1';
          el.style.transform = 'none';
        }, 0);
      }
      revealObs.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => {
    if (el.closest('.hero-content')) return; // hero handled separately
    revealObs.observe(el);
  });

  /* ══════════════════════════════════════════
     9. COUNTER ANIMATION
  ══════════════════════════════════════════ */
  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10);
    const dur    = 1600;
    const start  = performance.now();
    function step(now) {
      const t = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(e * target);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  const cntObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCount(e.target); cntObs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach(el => cntObs.observe(el));

  // Hero counters (run after loader)
  document.querySelectorAll('.counter-hero').forEach(el => {
    setTimeout(() => animateCount(el), 1400);
  });

  /* ══════════════════════════════════════════
     10. HORIZONTAL DRAG CAROUSEL
  ══════════════════════════════════════════ */
  const carouselWrap = document.getElementById('servicos-carousel-wrap');
  const dragIndicator = document.getElementById('drag-indicator');

  if (carouselWrap) {
    let isDown = false, startX = 0, scrollLeft = 0;

    carouselWrap.addEventListener('mousedown', e => {
      isDown = true;
      carouselWrap.classList.add('is-dragging');
      startX    = e.pageX - carouselWrap.offsetLeft;
      scrollLeft = carouselWrap.scrollLeft;
    });

    const endDrag = () => {
      isDown = false;
      carouselWrap.classList.remove('is-dragging');
    };

    carouselWrap.addEventListener('mouseleave', endDrag);
    carouselWrap.addEventListener('mouseup',    endDrag);
    carouselWrap.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x    = e.pageX - carouselWrap.offsetLeft;
      const walk = (x - startX) * 1.5;
      carouselWrap.scrollLeft = scrollLeft - walk;
    });

    // Hide drag indicator after first scroll
    carouselWrap.addEventListener('scroll', () => {
      dragIndicator && dragIndicator.classList.add('hidden');
    }, { once: true, passive: true });

    // Touch scrolling works natively via overflow-x: auto
  }

  /* ══════════════════════════════════════════
     11. HERO LINE REVEAL (split-line spans)
  ══════════════════════════════════════════ */
  document.querySelectorAll('.split-line').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.display = 'block';
    el.style.transition = 'opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1)';
  });

  /* ══════════════════════════════════════════
     12. CONTACT FORM
  ══════════════════════════════════════════ */
  const form    = document.getElementById('contato-form');
  const formOk  = document.getElementById('form-success');
  const formBtn = document.getElementById('form-submit');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      formBtn.disabled  = true;
      formBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

      setTimeout(() => {
        formBtn.innerHTML = '<i class="fas fa-check"></i> Enviado!';
        formOk.classList.add('show');
        form.reset();

        setTimeout(() => {
          formBtn.disabled  = false;
          formBtn.innerHTML = '<span>Enviar mensagem</span><i class="fas fa-arrow-right"></i>';
          formOk.classList.remove('show');
        }, 5000);
      }, 1600);
    });
  }

  /* ══════════════════════════════════════════
     13. SMOOTH ACTIVE NAV LINKS
  ══════════════════════════════════════════ */
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link');

  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' }).observe.bind(
    new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navAnchors.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' })
  );

  // Simpler version:
  const secObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        navAnchors.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => secObs.observe(s));

  /* ══════════════════════════════════════════
     14. SCROLL CUE FADE
  ══════════════════════════════════════════ */
  const scrollCue = document.getElementById('hero-scroll-cue');
  const heroEl    = document.getElementById('hero');
  if (scrollCue && heroEl) {
    window.addEventListener('scroll', () => {
      const fade = Math.max(0, 1 - window.scrollY / 250);
      scrollCue.style.opacity = fade;
    }, { passive: true });
  }

})();
