/* SORARU LIVE 2026 -HALLOWEEN- */
document.addEventListener('DOMContentLoaded', function () {

  /* --- Header background on scroll --- */
  const header = document.getElementById('header');
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* --- Hamburger menu --- */
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  });
  // close menu after clicking a link
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.classList.remove('is-open');
    });
  });

  /* --- Scroll reveal --- */
  const targets = document.querySelectorAll(
    '.news__item, .goods__soon, .card, .sched__col, .schedule__card, .ticket__price, .ticket__phase, .ticket__btn, .notice__box, .profile__inner, .movie__card, .section__title'
  );
  targets.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach(el => io.observe(el));
  } else {
    targets.forEach(el => el.classList.add('is-visible'));
  }

  /* --- Star trail (long-exposure rotation) --- */
  const canvas = document.getElementById('starfield');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let w, h, cx, cy, stars = [], dpr = 1, raf = null;

    // rotation center: screen center
    const CENTER = { x: 0.5, y: 0.5 };
    const STAR_COLORS = ['#ffffff', '#ffd9b0', '#bcd8ff', '#ffe9c2'];

    function setup() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      // display size is handled by CSS (.starfield: fixed; inset:0; 100%),
      // so the fixed canvas always fills the viewport even when the mobile
      // address bar shows/hides — no inline px override here.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w * CENTER.x;
      cy = h * CENTER.y;

      // density scales with area — denser to match the KV's fine concentric trails
      // lighter on small screens to save battery / GPU
      const isMobile = w <= 768;
      const cap = isMobile ? 200 : 460;
      const divisor = isMobile ? 6500 : 4200;
      const count = Math.min(cap, Math.round((w * h) / divisor));
      stars = [];
      const maxR = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy));
      for (let i = 0; i < count; i++) {
        stars.push({
          angle: Math.random() * Math.PI * 2,
          radius: Math.pow(Math.random(), 0.5) * maxR,   // more even spread → evenly-spaced concentric arcs
          size: Math.random() * 0.7 + 0.3,              // thinner trails like the KV
          color: STAR_COLORS[(Math.random() * STAR_COLORS.length) | 0],
          tw: Math.random() * Math.PI * 2
        });
      }
      // base fill so trails build on dark, not transparent
      ctx.fillStyle = '#07060d';
      ctx.fillRect(0, 0, w, h);
    }

    const SPEED = 0.00004; // radians per ms — extremely slow long-exposure feel

    let last = performance.now();
    function frame(now) {
      const dt = Math.min(now - last, 60);
      last = now;

      // persistence: faint veil instead of clearing → leaves light trails
      ctx.fillStyle = 'rgba(7,6,13,0.018)';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';
      for (const s of stars) {
        s.angle += SPEED * dt;
        s.tw += 0.012;
        const x = cx + Math.cos(s.angle) * s.radius;
        const y = cy + Math.sin(s.angle) * s.radius;
        const flick = 0.9 + Math.sin(s.tw) * 0.1;
        ctx.fillStyle = s.color;
        ctx.globalAlpha = 0.12 * flick;       // very dim head → eye follows the trail, not the dot
        ctx.beginPath();
        ctx.arc(x, y, s.size * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (raf == null && !reduceMotion) { last = performance.now(); raf = requestAnimationFrame(frame); }
    }
    function stop() {
      if (raf != null) { cancelAnimationFrame(raf); raf = null; }
    }

    setup();
    if (reduceMotion) {
      // static starfield (single frame, no trails)
      ctx.globalCompositeOperation = 'lighter';
      for (const s of stars) {
        const x = cx + Math.cos(s.angle) * s.radius;
        const y = cy + Math.sin(s.angle) * s.radius;
        ctx.fillStyle = s.color; ctx.globalAlpha = 0.6;
        ctx.beginPath(); ctx.arc(x, y, s.size, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    } else {
      start();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });

    // Only rebuild on a real width change. Mobile scrolling toggles the
    // address bar, which fires resize with a changed height but same width —
    // rebuilding there caused the background to "reload" and stutter.
    let lastW = window.innerWidth;
    let resizeT;
    window.addEventListener('resize', () => {
      if (window.innerWidth === lastW) return;   // height-only change → ignore
      lastW = window.innerWidth;
      clearTimeout(resizeT);
      resizeT = setTimeout(() => { stop(); setup(); start(); }, 200);
    }, { passive: true });
  }

});
