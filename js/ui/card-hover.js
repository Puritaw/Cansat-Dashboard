// js/ui/card-hover.js — Card hover glow effect

document.querySelectorAll('.card, .map-card, .stats-card, .attitude-card').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%';
    const y = ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%';
    el.style.setProperty('--mx', x);
    el.style.setProperty('--my', y);
  });
});
