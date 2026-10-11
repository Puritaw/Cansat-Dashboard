// js/pages/page-switcher.js — Ground Station <-> CanSat page switching

// ===== PAGE SWITCHER =====
function showPage(name) {
  const current = document.querySelector('.page.page-active') || document.querySelector('.page[style*="block"]');
  const next = document.getElementById('page-' + name);
  if (current === next) return;

  const icons = { ground: '🚀', cansat: '🥫' };
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.textContent.trim() === icons[name]);
  });

  if (name === 'cansat') {
    if(typeof initGauges==='function') initGauges();
    if(typeof initCansatDashboard==='function') initCansatDashboard();
  }

  const ov = document.createElement('canvas');
  ov.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
  document.body.appendChild(ov);
  const ctx = ov.getContext('2d');
  const W = ov.width  = window.innerWidth;
  const H = ov.height = window.innerHeight;

  const DURATION    = 900;
  const SWITCH_AT   = 0.48;
  let startTime     = null;
  let pageSwitched  = false;

  function easeIn(t)  { return t * t * t; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function renderFrame(ts) {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / DURATION, 1);

    ctx.clearRect(0, 0, W, H);

    if (progress <= SWITCH_AT) {
      const p = easeIn(progress / SWITCH_AT);
      ctx.fillStyle = `rgba(2,8,16,${p})`;
      ctx.fillRect(0, 0, W, H);
      const scanY = p * H;
      const sg = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 20);
      sg.addColorStop(0,   'rgba(0,245,196,0)');
      sg.addColorStop(0.6, `rgba(0,245,196,${(1 - p) * 0.18})`);
      sg.addColorStop(1,   'rgba(0,245,196,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(0, scanY - 60, W, 80);
    }

    if (!pageSwitched && progress >= SWITCH_AT) {
      pageSwitched = true;
      if (current) { current.classList.remove('page-active'); current.style.display = 'none'; }
      next.style.display = 'block';
      requestAnimationFrame(() => next.classList.add('page-active'));
    }

    if (progress > SWITCH_AT) {
      const p = easeOut((progress - SWITCH_AT) / (1 - SWITCH_AT));
      ctx.fillStyle = `rgba(2,8,16,${1 - p})`;
      ctx.fillRect(0, 0, W, H);

      if (p < 0.85) {
        const irisR  = easeOut(p / 0.85) * Math.hypot(W, H) * 0.6;
        const irisAlpha = (1 - p / 0.85) * 0.22;
        const ig = ctx.createRadialGradient(W/2, H/2, irisR * 0.7, W/2, H/2, irisR);
        ig.addColorStop(0,    'rgba(0,245,196,0)');
        ig.addColorStop(0.82, `rgba(0,245,196,${irisAlpha})`);
        ig.addColorStop(0.92, `rgba(146,225,255,${irisAlpha * 0.5})`);
        ig.addColorStop(1,    'rgba(0,245,196,0)');
        ctx.fillStyle = ig;
        ctx.fillRect(0, 0, W, H);
      }

      const scanY2 = H - easeOut(p) * (H + 60);
      const sg2 = ctx.createLinearGradient(0, scanY2 - 20, 0, scanY2 + 60);
      sg2.addColorStop(0,   'rgba(0,245,196,0)');
      sg2.addColorStop(0.4, `rgba(152,251,152,${(1 - p) * 0.20})`);
      sg2.addColorStop(1,   'rgba(0,245,196,0)');
      ctx.fillStyle = sg2;
      ctx.fillRect(0, scanY2 - 20, W, 80);
    }

    if (progress < 1) {
      requestAnimationFrame(renderFrame);
    } else {
      ov.remove();
    }
  }

  requestAnimationFrame(renderFrame);
}

document.addEventListener('DOMContentLoaded', () => {
  const first = document.getElementById('page-ground');
  if (first) { first.style.display='block'; first.classList.add('page-active'); }
});
