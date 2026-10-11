// js/ui/team-signal.js — Team-number signal indicator

// ===== TEAM NUMBER SIGNAL HELPER =====
function updateTeamSignal(received) {
  const teamNum  = document.querySelector('.cs-team-number');
  const teamRing = document.querySelector('.cs-team-ring');
  const badge    = document.querySelector('.cs-signal-badge');

  if (teamNum) {
    teamNum.classList.toggle('signal-on',  received);
    teamNum.classList.toggle('signal-off', !received);
  }
  if (teamRing) {
    teamRing.classList.toggle('signal-on',  received);
    teamRing.classList.toggle('signal-off', !received);
  }
  if (badge) {
    badge.textContent = received ? 'RX ●' : 'NO SIGNAL';
    badge.classList.toggle('signal-on',  received);
    badge.classList.toggle('signal-off', !received);
  }
}
