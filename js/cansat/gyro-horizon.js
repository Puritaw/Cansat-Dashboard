// js/cansat/gyro-horizon.js — CanSat artificial horizon

// ---- 2. Artificial Horizon ----
function initGyroHorizon() {
  const canvas = document.getElementById('gyroHorizonCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const S = 160;
  canvas.width = S * (window.devicePixelRatio||1);
  canvas.height = S * (window.devicePixelRatio||1);
  canvas.style.width = S + 'px';
  canvas.style.height = S + 'px';

  let dispRoll = 0, dispPitch = 0;

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = S/2, cy = S/2, R = S/2 - 6;
    ctx.clearRect(0, 0, S, S);
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.clip();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(dispRoll * Math.PI/180);
    const pitchOff = (dispPitch / 90) * R;
    ctx.fillStyle = '#0a3060'; ctx.fillRect(-R, -R*2 + pitchOff, R*2, R*2);
    ctx.fillStyle = '#4a2800'; ctx.fillRect(-R, pitchOff, R*2, R*2);
    ctx.beginPath(); ctx.moveTo(-R, pitchOff); ctx.lineTo(R, pitchOff);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    for (let d = 10; d <= 40; d += 10) {
      const y0 = pitchOff - (d/90)*R, y1 = pitchOff + (d/90)*R;
      const w = d % 20 === 0 ? 28 : 18;
      [y0, y1].forEach(yy => {
        ctx.beginPath(); ctx.moveTo(-w, yy); ctx.lineTo(w, yy);
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 0.8; ctx.stroke();
      });
    }
    ctx.restore(); ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2);
    ctx.strokeStyle = '#a78bfa88'; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx-22, cy); ctx.lineTo(cx-8, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+8,  cy); ctx.lineTo(cx+22, cy); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI*2);
    ctx.fillStyle = '#fff'; ctx.fill();
    for (let a = -60; a <= 60; a += 10) {
      const rad = (a - 90) * Math.PI/180;
      const inner = R - (Math.abs(a)%30===0 ? 10 : 6);
      ctx.beginPath();
      ctx.moveTo(cx + R*Math.cos(rad), cy + R*Math.sin(rad));
      ctx.lineTo(cx + inner*Math.cos(rad), cy + inner*Math.sin(rad));
      ctx.strokeStyle = 'rgba(167,139,250,0.7)'; ctx.lineWidth = 1; ctx.stroke();
    }
  }

  function anim() {
    requestAnimationFrame(anim);
    const r = parseFloat(document.getElementById('gyroRollDisp')?.textContent) || 0;
    const p = parseFloat(document.getElementById('gyroPitchDisp')?.textContent) || 0;
    dispRoll  += (r - dispRoll) * 0.08;
    dispPitch += (p - dispPitch) * 0.08;
    draw();
  }
  anim();
}
