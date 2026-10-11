// js/ui/rocket-speed.js — Rocket speed digital display

// ============================================================
// ROCKET SPEED Digital Display
// ============================================================
(function initRocketSpeed() {
  let maxSpeed = 0;
  let prevAlt = null, prevT = null;

  function render(displaySpeed) {
    if (displaySpeed > maxSpeed) maxSpeed = displaySpeed;
    const el    = document.getElementById('rocketSpeedVal');
    const elKmh = document.getElementById('rocketSpeedKmh');
    const elMax = document.getElementById('rocketMaxVal');
    const elBar = document.getElementById('rocketSpeedBar');
    const elLbl = document.getElementById('rocketStatusLabel');

    if (el) {
      el.textContent = displaySpeed.toFixed(1).padStart(5, '0');
      if (displaySpeed < 2) {
        el.style.color = '#98FB98';
        el.style.textShadow = '0 0 24px rgba(152,251,152,0.6),0 0 48px rgba(152,251,152,0.25)';
      } else if (displaySpeed < 8) {
        el.style.color = '#f5d800';
        el.style.textShadow = '0 0 24px rgba(245,216,0,0.6),0 0 48px rgba(245,216,0,0.25)';
      } else {
        el.style.color = '#ff4e6a';
        el.style.textShadow = '0 0 24px rgba(255,78,106,0.6),0 0 48px rgba(255,78,106,0.25)';
      }
    }
    if (elKmh) elKmh.textContent = (displaySpeed * 3.6).toFixed(1) + ' km/h';
    if (elMax) elMax.textContent = maxSpeed.toFixed(1);
    if (elBar) elBar.style.width = Math.min(100, (displaySpeed / 500) * 100) + '%';
    if (elLbl) {
      elLbl.textContent = displaySpeed < 0.5 ? 'STANDBY' : displaySpeed < 5 ? 'ASCENDING' : displaySpeed < 15 ? 'BOOST' : 'MAX THRUST';
    }
  }

  // ESP ส่งความเร็วมาเอง (m/s)
  window.setRocketSpeed = function(speedMs) { render(Math.abs(speedMs)); };

  // ไม่มี field speed -> คำนวณจากความสูง โดยใช้เวลาจริงระหว่างแพ็กเกจ
  window.updateRocketSpeed = function(currentAlt, tMs) {
    const now = tMs ?? Date.now();
    if (prevAlt === null) { prevAlt = currentAlt; prevT = now; return; }
    const dt = (now - prevT) / 1000;
    if (dt < 0.05) return;                 // แพ็กเกจถี่เกินไป / เวลาซ้ำ
    const rawSpeed = (currentAlt - prevAlt) / dt;
    prevAlt = currentAlt; prevT = now;
    render(Math.abs(rawSpeed));
  };
})();
// ============================================================
