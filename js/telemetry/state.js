// js/telemetry/state.js — Telemetry state, link status (LIVE / WAITING / SIGNAL LOST), transport indicator

// ---- state ----
const TM = { first: null, lastRx: 0, count: 0, linkOk: null, seqFirst: null, seqLast: null, seqRecv: 0 };

function pushPoint(chart, label, value) {
  const labels = chart.data.labels, data = chart.data.datasets[0].data;
  labels.push(label); data.push(value);
  while (labels.length > TELEMETRY_CONFIG.maxChartPoints) { labels.shift(); data.shift(); }
  chart.update('none');
}

// ---- link status (LIVE / WAITING / SIGNAL LOST) ----
function setLink(ok) {
  if (TM.linkOk === ok) return;
  TM.linkOk = ok;
  window._telemetryLinkOk = ok;
  updateTeamSignal(ok);
  const text = ok ? 'LIVE' : (TM.count ? 'SIGNAL LOST' : 'WAITING');
  document.querySelectorAll('.live-text').forEach(e => { e.textContent = text; });
  document.querySelectorAll('.live-badge').forEach(b => {
    b.style.opacity = ok ? '' : '0.55';
    b.style.filter  = ok ? '' : 'grayscale(1)';
  });
}
setInterval(() => {
  if (TM.lastRx && Date.now() - TM.lastRx > TELEMETRY_CONFIG.staleMs) setLink(false);
}, 500);
setLink(false);

// ---- sidebar dot = สถานะ transport ----
function setTransport(name, connected) {
  const dot = document.querySelector('.status-dot');
  if (!dot) return;
  dot.style.background = connected ? '#00f5c4' : '#ff4e6a';
  dot.title = name + (connected ? ' connected' : ' disconnected');
  console.log('[Transport]', name, connected ? 'connected' : 'disconnected');
}
