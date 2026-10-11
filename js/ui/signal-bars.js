// js/ui/signal-bars.js — LoRa RSSI signal bars

// ---- Signal bars ----
const signalBarsEl = document.getElementById('signalBars');
function buildBars(rssi) {
  const level = Number.isFinite(rssi) ? Math.max(0, Math.min(10, Math.round((rssi + 120) / 7))) : 0;
  signalBarsEl.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const bar = document.createElement('div');
    bar.className = 'sig-bar' + (i < level ? ' active' : '');
    bar.style.height = (14 + i * 2.5) + 'px';
    signalBarsEl.appendChild(bar);
  }
}
buildBars(null);
