// js/cansat/init.js — CanSat page initialisation

// ===== CANSAT DASHBOARD INIT =====
let cansatInited = false;

function initCansatDashboard() {
  if (cansatInited) return;
  cansatInited = true;

  const teamNum  = document.querySelector('.cs-team-number');
  const teamRing = document.querySelector('.cs-team-ring');
  const teamWrap = document.querySelector('.cs-team-number-wrap');

  const linkUp = window._telemetryLinkOk === true;
  if (teamNum)  teamNum.classList.add(linkUp ? 'signal-on' : 'signal-off');
  if (teamRing) teamRing.classList.add(linkUp ? 'signal-on' : 'signal-off');

  if (teamWrap && !teamWrap.querySelector('.cs-signal-badge')) {
    const badge = document.createElement('div');
    badge.className = 'cs-signal-badge ' + (linkUp ? 'signal-on' : 'signal-off');
    badge.textContent = linkUp ? 'RX ●' : 'NO SIGNAL';
    teamWrap.appendChild(badge);
  }

  initGyroAxes();
  initGyroHorizon();
  initGyroCompass();
  initCsMap();
  initCsAccel();
}

let wheelInited = false;
function initGauges() {
  if(wheelInited) return;
  wheelInited = true;
  setInterval(()=>{
    const now=new Date();
    const el=document.getElementById('clockDisplay2');
    if(el) el.textContent=[now.getHours(),now.getMinutes(),now.getSeconds()].map(v=>String(v).padStart(2,'0')).join(':');
  },1000);
  initCansatDashboard();
}
