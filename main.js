/* ============================================================
   SURYA PORTFOLIO — Framer-style animations
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  // ── UTILS ──
  function splitChars(el) {
    const text = el.textContent.trim();
    el.textContent = '';
    text.split('').forEach((char) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      el.appendChild(span);
    });
    return el.querySelectorAll('.char');
  }

  function splitLines(els) {
    els.forEach((el) => {
      const originalHTML = el.innerHTML.trim();
      el.innerHTML = '';
      const wrap = document.createElement('span');
      wrap.className = 'line';
      const inner = document.createElement('span');
      inner.className = 'line-inner';
      inner.innerHTML = originalHTML || '\u00A0';
      wrap.appendChild(inner);
      el.appendChild(wrap);
    });
  }

  function splitWords(el) {
    el.classList.add('split-words');
    const lineInner = el.querySelector('.line-inner') || el;
    const tempHtml = `>${lineInner.innerHTML}<`;
    lineInner.innerHTML = tempHtml.replace(/>([^<]+)</g, (match, text) => {
      const words = text.split(/(\s+)/).map((part) => {
        if (!part.trim()) return part;
        return `<span class="word-wrap"><span class="word">${part}</span></span>`;
      }).join('');
      return `>${words}<`;
    }).slice(1, -1);
    return lineInner.querySelectorAll('.word');
  }

  // ── PRELOADER (Premium 3D intro) ──
  const preloader = document.getElementById('preloader');
  const preloaderText = document.querySelector('.preloader-text');
  const preloaderFill = document.getElementById('preloaderFill');
  const preloaderPercent = document.getElementById('preloaderPercent');
  const preloaderChars = splitChars(preloaderText);
  const preloaderMark = document.querySelector('.preloader-mark');
  const preloaderTag = document.querySelector('.preloader-tag');
  const preloaderOrbit = document.querySelector('.preloader-orbit');
  const preloaderContent = document.querySelector('.preloader-content');

  function initPreloader3D() {
    const canvas = document.getElementById('preloader3d');
    if (!canvas || typeof THREE === 'undefined' || prefersReducedMotion) {
      return { setProgress: () => {}, destroy: () => {} };
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 80);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    const count = 380;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cPink = new THREE.Color(0x810100);
    const cPurple = new THREE.Color(0x630102);
    const cCyan = new THREE.Color(0xedebde);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      const mix = Math.random();
      const col = mix < 0.34 ? cPink : mix < 0.67 ? cPurple : cCyan;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: 0.11,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    scene.add(particles);

    const rings = [];
    [
      { r: 3.2, color: 0x810100, wire: true },
      { r: 4.1, color: 0xedebde, wire: true },
      { r: 2.4, color: 0x630102, wire: false },
    ].forEach((def) => {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(def.r, 0.04, 10, 96),
        new THREE.MeshBasicMaterial({ color: def.color, wireframe: def.wire, transparent: true, opacity: def.wire ? 0.22 : 0.14 })
      );
      mesh.rotation.x = Math.PI * 0.42;
      scene.add(mesh);
      rings.push(mesh);
    });

    let progress = 0;
    let exitBoost = 0;
    let alive = true;
    const clock = { t: 0 };

    function resize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    }
    window.addEventListener('resize', resize);

    function render() {
      if (!alive) return;
      requestAnimationFrame(render);
      clock.t += 0.016;
      const breathe = 1 + progress * 0.35 + exitBoost * 1.8;
      particles.rotation.y = clock.t * 0.22;
      particles.rotation.x = Math.sin(clock.t * 0.35) * 0.12;
      particles.scale.setScalar(0.75 + progress * 0.35 + exitBoost * 2.5);
      rings.forEach((ring, i) => {
        ring.rotation.z = clock.t * (0.18 + i * 0.06);
        ring.rotation.y = clock.t * 0.12;
        ring.scale.setScalar(breathe);
      });
      camera.position.z = 9 - progress * 2.5 - exitBoost * 4;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    render();

    return {
      setProgress(p) { progress = p; },
      burst() { exitBoost = 1; },
      destroy() {
        alive = false;
        window.removeEventListener('resize', resize);
        renderer.dispose();
        pGeo.dispose();
      },
    };
  }

  if (preloader) {
    preloader.classList.add('done');
  }
  initSite();

  function initSite() {
    document.body.classList.add('loaded');

    // ── LENIS SMOOTH SCROLL ──
    let lenis;
    if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
      });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    gsap.registerPlugin(ScrollTrigger);

    // Portfolio video embeds
    function getYouTubeVideo(urlText) {
      try {
        const url = new URL(urlText, window.location.href);
        const host = url.hostname.replace(/^www\./, '');
        const parts = url.pathname.split('/').filter(Boolean);
        let id = '';
        let wide = true;

        if (host === 'youtu.be') {
          id = parts[0] || '';
        } else if (host.endsWith('youtube.com')) {
          if (parts[0] === 'shorts') {
            id = parts[1] || '';
            wide = false;
          } else if (parts[0] === 'embed') {
            id = parts[1] || '';
          } else {
            id = url.searchParams.get('v') || '';
          }
        }

        id = id.replace(/[^a-zA-Z0-9_-]/g, '');
        return id ? { id, wide } : null;
      } catch (error) {
        return null;
      }
    }

    function getInstagramEmbedUrl(urlText) {
      try {
        const url = new URL(urlText, window.location.href);
        if (!url.hostname.includes('instagram.com')) return '';

        const parts = url.pathname.split('/').filter(Boolean);
        const type = ['p', 'reel', 'tv'].includes(parts[0]) ? parts[0] : '';
        const code = parts[1] || '';
        return type && code ? `https://www.instagram.com/${type}/${code}/embed` : '';
      } catch (error) {
        return '';
      }
    }

    function initPortfolioVideos() {
      document.querySelectorAll('.work-thumb[data-video-url]').forEach((thumb) => {
        const rawUrl = (thumb.dataset.videoUrl || '').trim();
        if (!rawUrl) return;

        const title = thumb.querySelector('.work-overlay span')?.textContent.trim() || 'Portfolio video';
        const overlay = thumb.querySelector('.work-overlay');
        const media = document.createElement('div');
        media.className = 'work-video';
        thumb.classList.add('has-video');

        const youtube = getYouTubeVideo(rawUrl);
        const instagramEmbedUrl = getInstagramEmbedUrl(rawUrl);
        const isLocalVideo = /\.(mp4|webm|ogg)(\?|#|$)/i.test(rawUrl);

        if (youtube) {
          if (youtube.wide) thumb.classList.add('video-wide');

          const preview = document.createElement('button');
          preview.type = 'button';
          preview.className = 'work-video-preview';
          preview.setAttribute('aria-label', `Play ${title}`);

          const image = document.createElement('img');
          image.src = `https://img.youtube.com/vi/${youtube.id}/hqdefault.jpg`;
          image.alt = `${title} thumbnail`;
          image.loading = 'lazy';

          const play = document.createElement('span');
          play.className = 'work-video-play';
          play.setAttribute('aria-hidden', 'true');

          preview.append(image, play);
          preview.addEventListener('click', () => {
            const iframe = document.createElement('iframe');
            iframe.title = title;
            iframe.src = `https://www.youtube.com/embed/${youtube.id}?autoplay=1&rel=0&modestbranding=1`;
            iframe.loading = 'lazy';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            iframe.allowFullscreen = true;
            media.replaceChildren(iframe);
          });

          media.appendChild(preview);
        } else if (instagramEmbedUrl) {
          const iframe = document.createElement('iframe');
          iframe.title = title;
          iframe.src = instagramEmbedUrl;
          iframe.loading = 'lazy';
          iframe.allow = 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share';
          media.appendChild(iframe);
        } else if (isLocalVideo) {
          const video = document.createElement('video');
          video.src = rawUrl;
          video.controls = true;
          video.playsInline = true;
          video.preload = 'metadata';
          media.appendChild(video);
        } else {
          const link = document.createElement('a');
          link.className = 'work-video-preview';
          link.href = rawUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.setAttribute('aria-label', `Open ${title}`);
          link.innerHTML = '<span class="work-video-play" aria-hidden="true"></span>';
          media.appendChild(link);
        }

        thumb.insertBefore(media, overlay || null);
      });
    }
    initPortfolioVideos();
    // ── THREE.JS FULL-PAGE 3D BACKGROUND ──
    let set3DScrollY = () => {};
    function initGlobal3D() {
      const canvas = document.getElementById('bg3d');
      if (!canvas || typeof THREE === 'undefined' || prefersReducedMotion) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
      camera.position.set(0, 0, 32);

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

      const count = 900;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const c1 = new THREE.Color(0x810100);
      const c2 = new THREE.Color(0x630102);
      const c3 = new THREE.Color(0xedebde);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 90;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
        const mix = Math.random();
        const col = mix < 0.33 ? c1 : mix < 0.66 ? c2 : c3;
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
        size: 0.14,
        vertexColors: true,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }));
      scene.add(particles);

      const grid = new THREE.GridHelper(120, 40, 0x810100, 0x0A2E2A);
      grid.position.y = -18;
      grid.material.transparent = true;
      grid.material.opacity = 0.12;
      scene.add(grid);

      const shapes = [];
      const shapeDefs = [
        { geo: new THREE.TorusKnotGeometry(3.2, 0.55, 100, 14), pos: [14, 4, -8], color: 0x630102, wire: true },
        { geo: new THREE.IcosahedronGeometry(2.8, 0), pos: [-16, -2, -12], color: 0x810100, wire: true },
        { geo: new THREE.OctahedronGeometry(2.2, 0), pos: [10, -8, -5], color: 0xedebde, wire: true },
        { geo: new THREE.TorusGeometry(6, 0.05, 8, 64), pos: [-10, 6, -15], color: 0xedebde, wire: false },
      ];
      shapeDefs.forEach((def) => {
        const mat = new THREE.MeshBasicMaterial({
          color: def.color,
          wireframe: def.wire,
          transparent: true,
          opacity: def.wire ? 0.22 : 0.2,
        });
        const mesh = new THREE.Mesh(def.geo, mat);
        mesh.position.set(...def.pos);
        scene.add(mesh);
        shapes.push(mesh);
      });

      let mx = 0, my = 0, scrollY = 0;
      window.addEventListener('mousemove', (e) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
      });
      set3DScrollY = (y) => { scrollY = y; };
      window.addEventListener('scroll', () => set3DScrollY(window.scrollY), { passive: true });

      function resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      }
      resize();
      window.addEventListener('resize', resize);

      function animate() {
        requestAnimationFrame(animate);
        const t = performance.now() * 0.001;
        particles.rotation.y = t * 0.02;
        particles.rotation.x = Math.sin(t * 0.1) * 0.05;
        shapes.forEach((s, i) => {
          s.rotation.x += 0.003 + i * 0.0005;
          s.rotation.y += 0.004 + i * 0.0003;
        });
        const scrollFactor = scrollY * 0.008;
        camera.position.x += (mx * 4 - camera.position.x) * 0.03;
        camera.position.y += (-my * 3 + scrollFactor - camera.position.y) * 0.03;
        camera.lookAt(0, scrollFactor * 0.3, 0);
        renderer.render(scene, camera);
      }
      animate();
    }
    initGlobal3D();
    if (lenis) {
      lenis.on('scroll', (e) => set3DScrollY(e.scroll));
    }

    // ── POINTER MOTION (cursor, tilt, magnetic, parallax) ──
    function initPointerMotion() {
      if (isTouch || prefersReducedMotion || !window.matchMedia('(pointer: fine)').matches) return;

      const dot = document.getElementById('cursorDot');
      const ring = document.getElementById('cursorRing');
      const glow = document.getElementById('cursorGlow');
      const heroBg = document.querySelector('.hero-bg-word');
      if (!dot || !ring) return;

      document.body.classList.add('cursor-ready');

      let targetX = window.innerWidth * 0.5;
      let targetY = window.innerHeight * 0.5;
      let dotX = targetX;
      let dotY = targetY;
      let ringX = targetX;
      let ringY = targetY;
      let glowX = targetX;
      let glowY = targetY;
      let heroX = 0;
      let heroY = 0;
      let ringRotation = 0;
      let lastDotX = dotX;
      let lastDotY = dotY;

      const tiltItems = [];
      function registerTilt(selector, intensity) {
        document.querySelectorAll(selector).forEach((el) => {
          const item = {
            el,
            intensity,
            tx: 0,
            ty: 0,
            cx: 0,
            cy: 0,
            hover: false,
            rotY: gsap.quickTo(el, 'rotateY', { duration: 0.75, ease: 'power3.out' }),
            rotX: gsap.quickTo(el, 'rotateX', { duration: 0.75, ease: 'power3.out' }),
            zTo: gsap.quickTo(el, 'z', { duration: 0.75, ease: 'power3.out' }),
          };
          gsap.set(el, { transformPerspective: 1100, transformStyle: 'preserve-3d' });
          el.addEventListener('mousemove', (e) => {
            const r = el.getBoundingClientRect();
            item.tx = (e.clientX - r.left) / r.width - 0.5;
            item.ty = (e.clientY - r.top) / r.height - 0.5;
            item.hover = true;
          });
          el.addEventListener('mouseleave', () => {
            item.hover = false;
            item.tx = 0;
            item.ty = 0;
          });
          tiltItems.push(item);
        });
      }
      registerTilt('.hero-tilt', 5);
      registerTilt('.hero-showcase', 8);
      registerTilt('.card-3d:not(.work-card):not(.service-panel):not(.hero-showcase)', 11);

      const magneticItems = [];
      document.querySelectorAll('.magnetic').forEach((el) => {
        magneticItems.push({
          el,
          xTo: gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' }),
          yTo: gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3.out' }),
        });
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const dist = Math.hypot(dx, dy);
          const pull = Math.min(1, 140 / (dist + 50));
          const item = magneticItems.find((m) => m.el === el);
          if (item) {
            item.xTo(dx * 0.38 * pull);
            item.yTo(dy * 0.38 * pull);
          }
        });
        el.addEventListener('mouseleave', () => {
          const item = magneticItems.find((m) => m.el === el);
          if (item) {
            item.xTo(0);
            item.yTo(0);
          }
  });
});

      document.querySelectorAll('a, button, .magnetic').forEach((el) => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
      });

      window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
      });
      window.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
      window.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'));

      const placeCursor = (el, x, y, rot = 0) => {
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${rot}deg)`;
      };

      gsap.ticker.add(() => {
        dotX += (targetX - dotX) * 0.42;
        dotY += (targetY - dotY) * 0.42;
        ringX += (targetX - ringX) * 0.14;
        ringY += (targetY - ringY) * 0.14;
        glowX += (targetX - glowX) * 0.09;
        glowY += (targetY - glowY) * 0.09;

        const velX = dotX - lastDotX;
        const velY = dotY - lastDotY;
        ringRotation += velX * 0.55;
        ringRotation *= 0.92;
        lastDotX = dotX;
        lastDotY = dotY;

        placeCursor(dot, dotX, dotY);
        placeCursor(ring, ringX, ringY, ringRotation);
        if (glow) placeCursor(glow, glowX, glowY);

        const nx = (targetX / window.innerWidth - 0.5) * 2;
        const ny = (targetY / window.innerHeight - 0.5) * 2;
        heroX += (nx * 32 - heroX) * 0.06;
        heroY += (ny * 20 - heroY) * 0.06;
        if (heroBg) {
          gsap.set(heroBg, {
            x: heroX,
            y: heroY,
            rotateY: heroX * 0.15,
            rotateX: -heroY * 0.08,
          });
        }

        tiltItems.forEach((item) => {
          const ease = item.hover ? 0.18 : 0.1;
          item.cx += (item.tx - item.cx) * ease;
          item.cy += (item.ty - item.cy) * ease;
          item.rotY(item.cx * item.intensity);
          item.rotX(-item.cy * item.intensity);
          item.zTo(item.hover ? 18 + Math.abs(item.cx) * 8 : 0);
        });
      });
    }
    initPointerMotion();

    // ── SPLIT TEXT SETUP ──
    document.querySelectorAll('[data-split]').forEach((el) => splitChars(el));
    splitLines(document.querySelectorAll('.split-lines'));

    document.querySelectorAll('.section-heading, .offer-title, .tagline-text').forEach((el) => {
      if (el.closest('.hscroll-header')) return;
      splitWords(el);
    });

    const lineInners = document.querySelectorAll('.split-lines .line-inner');
    const heroChars = document.querySelectorAll('.hero-name .char');
    const bigCtaChars = document.querySelectorAll('.big-cta-text .char');
    const headingWords = document.querySelectorAll('.split-words .word');

    gsap.set(lineInners, { y: '110%' });
    gsap.set(headingWords, { y: '110%' });

    // ── HERO ENTRANCE ──
    const heroTl = gsap.timeline({ delay: 0.1 });
    heroTl
      .from('#navbar', { y: -30, opacity: 0, duration: 0.9, ease: 'power3.out' })
      .from('.marquee-top', { y: -20, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .from(heroChars, {
        y: '110%',
        rotateX: -55,
        z: -80,
        duration: 1.1,
        stagger: 0.04,
        ease: 'power4.out',
      }, '-=0.4')
      .from('.hero-showcase', {
        x: 60,
        z: -120,
        rotateY: -25,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
      }, '-=0.7')
      .from('.hero-eyebrow .line-inner, .hero-role .line-inner, .hero-sub .line-inner', {
        y: '110%',
        duration: 0.9,
        stagger: 0.08,
        ease: 'power4.out',
      }, '-=0.7')
      .from('.hero-actions', { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
      .from('.hero-scroll .line-inner', { y: '110%', duration: 0.6, ease: 'power3.out' }, '-=0.3');

    // ── HERO PARALLAX ──
    if (!prefersReducedMotion) {
      gsap.to('.hero-bg-word', {
        y: 120,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

      gsap.to('.hero-tilt', {
        y: -80,
        rotateX: 12,
        opacity: 0.2,
        z: -100,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }

    // ── SCROLL REVEALS (Framer-style line mask) ──
    const revealLineInners = [...lineInners].filter((el) => !el.closest('.techniques-line'));
    ScrollTrigger.batch(revealLineInners, {
      start: 'top 88%',
      onEnter: (batch) => {
        gsap.to(batch, {
          y: 0,
          duration: 1.05,
          stagger: 0.08,
          ease: 'power4.out',
          overwrite: true,
        });
      },
    });

    ScrollTrigger.batch(headingWords, {
      start: 'top 85%',
      onEnter: (batch) => {
        gsap.to(batch, {
          y: 0,
          duration: 0.9,
          stagger: 0.035,
          ease: 'power4.out',
          overwrite: true,
        });
      },
    });

    gsap.utils.toArray('.reveal-up').forEach((el, i) => {
      gsap.fromTo(el,
        { y: 56, opacity: 0, rotateX: 22, transformPerspective: 900 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1.1,
          delay: (i % 3) * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // ── HORIZONTAL SCROLL (Abisheak / Framer-style pin + slide) ──
    const hScrollTriggers = [];
    const mobilePanelTriggers = [];

    function initHorizontalScroll(pinEl, trackEl, barFillEl, options = {}) {
      if (!pinEl || !trackEl || prefersReducedMotion) return null;

      const header = pinEl.querySelector('.hscroll-header');
      const isPortfolio = options.portfolio === true;

      const getAmount = () => {
        const viewport = pinEl.querySelector('.hscroll-viewport');
        const pad = 64;
        const viewW = viewport ? viewport.clientWidth : window.innerWidth;
        return -(trackEl.scrollWidth - viewW + pad);
      };

      const tween = gsap.to(trackEl, {
        x: getAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: pinEl,
          start: 'top top',
          end: () => `+=${Math.max(Math.abs(getAmount()) * 1.15, window.innerHeight * 1.25)}`,
          pin: true,
          scrub: 1.1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onEnter: () => pinEl.classList.add('is-pinned'),
          onLeave: () => pinEl.classList.remove('is-pinned'),
          onEnterBack: () => pinEl.classList.add('is-pinned'),
          onLeaveBack: () => pinEl.classList.remove('is-pinned'),
          onUpdate: (self) => {
            if (barFillEl) barFillEl.style.width = `${self.progress * 100}%`;

            if (header) {
              gsap.set(header, {
                y: self.progress * (isPortfolio ? -8 : -18),
                opacity: 1 - self.progress * (isPortfolio ? 0.15 : 0.35),
              });
            }

            const panels = trackEl.querySelectorAll('.hscroll-panel, .work-card');
            const total = Math.max(panels.length - 1, 1);
            const activeIndex = self.progress * total;

            panels.forEach((panel, i) => {
              const offset = i - activeIndex;
              const dist = Math.abs(offset);
              const focus = Math.max(0, 1 - dist * 0.85);

              panel.classList.toggle('is-active', dist < 0.5);

              if (isPortfolio) {
                gsap.set(panel, {
                  scale: 0.97 + focus * 0.03,
                  rotateY: offset * -3,
                  z: -dist * 12,
                  transformPerspective: 1400,
                  opacity: 1,
                });
              } else {
                gsap.set(panel, {
                  scale: 0.92 + focus * 0.08,
                  rotateY: offset * -14,
                  z: -dist * 40,
                  transformPerspective: 1200,
                  opacity: 0.7 + focus * 0.3,
                });
              }

              if (isPortfolio) {
                const thumb = panel.querySelector('.work-thumb');
                if (thumb) gsap.set(thumb, { clearProps: 'transform' });
              } else {
                const visual = panel.querySelector('.service-visual');
                if (visual) {
                  gsap.set(visual, {
                    x: offset * -20,
                    rotateY: offset * 8,
                  });
                }
                const pills = panel.querySelectorAll('.service-pills span');
                pills.forEach((pill, pi) => {
                  gsap.set(pill, {
                    y: (1 - focus) * 12 + pi * 2,
                    opacity: 0.4 + focus * 0.6,
                  });
                });
              }
            });
          },
        },
      });

      hScrollTriggers.push(tween.scrollTrigger);
      return tween.scrollTrigger;
    }

    function setupHorizontalScroll() {
      hScrollTriggers.forEach((st) => st.kill());
      mobilePanelTriggers.forEach((st) => st.kill());
      hScrollTriggers.length = 0;
      mobilePanelTriggers.length = 0;
      gsap.set('#servicesTrack, #portfolioTrack', { x: 0 });
      gsap.set('.service-panel, .work-card', { clearProps: 'transform,opacity' });

      if (window.innerWidth > 768) {
        initHorizontalScroll(
          document.getElementById('servicesPin'),
          document.getElementById('servicesTrack'),
          document.getElementById('servicesBarFill')
        );
        initHorizontalScroll(
          document.getElementById('portfolioPin'),
          document.getElementById('portfolioTrack'),
          document.getElementById('portfolioBarFill'),
          { portfolio: true }
        );
      } else {
        gsap.utils.toArray('.service-panel, .work-card').forEach((panel) => {
          const tween = gsap.from(panel, {
            x: 40,
            opacity: 0,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: panel,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
          });
          if (tween.scrollTrigger) mobilePanelTriggers.push(tween.scrollTrigger);
        });
      }
    }
    setupHorizontalScroll();

    // ── SECTION SCRUB ANIMATIONS ──
    gsap.fromTo('.personality-text',
      { scale: 0.88, opacity: 0.5, y: 40 },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '.personality',
          start: 'top bottom',
          end: 'center center',
          scrub: 1.2,
        },
      }
    );

    gsap.utils.toArray('.techniques-line .line-inner').forEach((el, i) => {
      gsap.fromTo(el, {
        y: '110%',
        rotateX: -35,
        transformPerspective: 800,
      }, {
        y: '0%',
        rotateX: 0,
        duration: 1.1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: '.techniques',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        delay: i * 0.14,
      });
    });

    gsap.from('.experience-card', {
      x: 72,
      rotateY: -28,
      opacity: 0,
      duration: 1.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.experience-card',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    gsap.utils.toArray('.marquee-band:not(.marquee-top)').forEach((band) => {
      gsap.from(band, {
        opacity: 0,
        y: 24,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: band,
          start: 'top 92%',
          toggleActions: 'play none none none',
        },
      });
    });

    // ── BIG CTA TEXT ──
    gsap.from(bigCtaChars, {
      y: '100%',
      rotateX: -30,
      duration: 1,
      stagger: 0.03,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: '.big-cta',
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
    });

    gsap.from('.big-cta-btn', {
      y: 30,
      z: -60,
      rotateX: 25,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.big-cta',
        start: 'top 70%',
        toggleActions: 'play none none none',
      },
    });

    gsap.to('.big-cta', {
      rotateX: -4,
      ease: 'none',
      scrollTrigger: {
        trigger: '.big-cta',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
    });

    // 3D flip-in for stat items
    gsap.utils.toArray('.stat-item').forEach((el, i) => {
      gsap.from(el, {
        rotateY: -40,
        z: -80,
        opacity: 0,
        duration: 0.9,
        delay: i * 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
    });

    // ── ANIMATED COUNTERS ──
    document.querySelectorAll('.stat-num').forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const obj = { val: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = Math.round(obj.val) + suffix;
            },
          });
        },
      });
    });

    // ── SKILL / TOOL BARS ──
    document.querySelectorAll('.tool-card').forEach((card) => {
      const fill = card.querySelector('.skill-fill');
      const level = fill.dataset.level + '%';

      ScrollTrigger.create({
        trigger: card,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(fill, { width: level, duration: 1.4, ease: 'power3.out' });
        },
      });
    });

    // ── SIDE NAV ACTIVE STATE ──
    const sideDots = document.querySelectorAll('.side-dot');
    const sections = document.querySelectorAll('section[id]');

    sections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => setActiveNav(section.id),
        onEnterBack: () => setActiveNav(section.id),
      });
    });

    const navItems = document.querySelectorAll('.nav-item');

    function setActiveNav(id) {
      sideDots.forEach((dot) => {
        dot.classList.toggle('active', dot.dataset.section === id);
      });
      navItems.forEach((item) => {
        item.classList.toggle('active', item.dataset.section === id);
      });
    }

    // ── NAVBAR SCROLL BEHAVIOR ──
    const navHeader = document.getElementById('navbar');
    let lastScroll = 0;

    function onNavScroll(y) {
      if (!navHeader) return;
      navHeader.classList.toggle('nav-scrolled', y > 60);
      if (y > 400) {
        navHeader.classList.toggle('nav-hidden', y > lastScroll && y > 500);
      } else {
        navHeader.classList.remove('nav-hidden');
      }
      lastScroll = y;
    }

    if (lenis) {
      lenis.on('scroll', (e) => onNavScroll(e.scroll));
    } else {
      window.addEventListener('scroll', () => onNavScroll(window.scrollY), { passive: true });
    }

    // ── NAV DRAWER ──
    const hamburger = document.getElementById('hamburger');
    const navDrawer = document.getElementById('navDrawer');
    const navLinks = navDrawer.querySelectorAll('.nav-link');

    gsap.set(navLinks, { y: '110%' });

    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      navDrawer.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      if (isOpen) {
        if (lenis) lenis.stop();
        gsap.fromTo(navLinks, { y: '110%' }, {
          y: 0,
          duration: 0.6,
          stagger: 0.06,
          ease: 'power4.out',
        });
      } else {
        if (lenis) lenis.start();
      }
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        navDrawer.classList.remove('open');
        document.body.style.overflow = '';
        if (lenis) lenis.start();
      });
    });

    // ── SMOOTH ANCHOR SCROLL ──
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const navOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 88;
        if (lenis) {
          lenis.scrollTo(target, { offset: -(navOffset + 12), duration: 1.4 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
  });
});

// ── CONTACT FORM ──
const form = document.getElementById('contactForm');
if (form) {
      form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
        const original = btn.innerHTML;
        btn.innerHTML = 'Message Sent ✓';
        btn.style.background = 'linear-gradient(135deg, #810100, #630102)';
    setTimeout(() => {
          btn.innerHTML = original;
      btn.style.background = '';
      form.reset();
    }, 3000);
  });
}

    // ── RESIZE REFRESH ──
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setupHorizontalScroll();
        ScrollTrigger.refresh();
      }, 250);
    });

    ScrollTrigger.refresh();
  }
})();
