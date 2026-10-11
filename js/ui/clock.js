// js/ui/clock.js — Wall clock + mission elapsed time

// ---- Clock & elapsed ----
let missionStartMs = null;   // ตั้งค่าตอนได้รับแพ็กเกจแรก
function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  const ss = String(now.getSeconds()).padStart(2,'0');
  document.getElementById('clockDisplay').textContent = `${hh}:${mm}:${ss}`;
  const elEl = document.getElementById('elapsedVal');
  if (elEl) elEl.textContent = missionStartMs ? Math.floor((Date.now() - missionStartMs) / 1000) + 's' : '—';
}

setInterval(updateClock, 1000);
updateClock();
