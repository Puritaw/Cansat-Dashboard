// js/cansat/gyro-compass.js — CanSat compass

// ---- 3. Compass ----
function initGyroCompass() {
  const canvas = document.getElementById('gyroCompassCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const S = 160;
  canvas.width = S * (window.devicePixelRatio||1);
  canvas.height = S * (window.devicePixelRatio||1);
  canvas.style.width = S + 'px';
  canvas.style.height = S + 'px';

  let dispYaw = 0;

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = S/2, cy = S/2, R = S/2 - 8;
    ctx.clearRect(0, 0, S, S);
    const grad = ctx.createRadialGradient(cx, cy, R*0.7, cx, cy, R);
    grad.addColorStop(0, 'rgba(167,139,250,0.05)');
    grad.addColorStop(1, 'rgba(167,139,250,0.20)');
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2);
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = '#a78bfa55'; ctx.lineWidth = 2; ctx.stroke();
    const dirs = ['N','NE','E','SE','S','SW','W','NW'];
    for (let i = 0; i < 36; i++) {
      const ang = (i/36)*Math.PI*2 - dispYaw*Math.PI/180 - Math.PI/2;
      const major = i % 9 === 0;
      const inner = R - (major ? 14 : 7);
      ctx.beginPath();
      ctx.moveTo(cx + R*Math.cos(ang), cy + R*Math.sin(ang));
      ctx.lineTo(cx + inner*Math.cos(ang), cy + inner*Math.sin(ang));
      ctx.strokeStyle = major ? 'rgba(167,139,250,0.9)' : 'rgba(167,139,250,0.3)';
      ctx.lineWidth = major ? 1.5 : 0.6; ctx.stroke();
      if (major) {
        const li = i / 9;
        const lx = cx + (inner-10)*Math.cos(ang);
        const ly = cy + (inner-10)*Math.sin(ang);
        ctx.font = '700 9px Orbitron, monospace';
        ctx.fillStyle = li === 0 ? '#ff4e6a' : '#a78bfacc';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(dirs[li], lx, ly);
      }
    }
    const needleAng = -Math.PI/2;
    ctx.save();
    ctx.shadowColor = '#ff4e6a'; ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(cx + (R-18)*Math.cos(needleAng), cy + (R-18)*Math.sin(needleAng));
    ctx.lineTo(cx + 6*Math.cos(needleAng+Math.PI/2), cy + 6*Math.sin(needleAng+Math.PI/2));
    ctx.lineTo(cx - 6*Math.cos(needleAng+Math.PI/2), cy - 6*Math.sin(needleAng+Math.PI/2));
    ctx.closePath(); ctx.fillStyle = '#ff4e6a'; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + (R-18)*Math.cos(needleAng+Math.PI), cy + (R-18)*Math.sin(needleAng+Math.PI));
    ctx.lineTo(cx + 6*Math.cos(needleAng+Math.PI/2), cy + 6*Math.sin(needleAng+Math.PI/2));
    ctx.lineTo(cx - 6*Math.cos(needleAng+Math.PI/2), cy - 6*Math.sin(needleAng+Math.PI/2));
    ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI*2);
    ctx.fillStyle = '#fff'; ctx.fill();
  }

  function anim() {
    requestAnimationFrame(anim);
    const y = parseFloat(document.getElementById('gyroYawDisp')?.textContent) || 0;
    dispYaw += (y - dispYaw) * 0.08;
    draw();
  }
  anim();
}
