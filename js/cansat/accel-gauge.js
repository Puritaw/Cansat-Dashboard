// js/cansat/accel-gauge.js — CanSat acceleration gauge

// ---- 5. Accel Gauge ----
function initCsAccel() {
  const canvas = document.getElementById('csAccelCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const S = 200;
  canvas.width = S * (window.devicePixelRatio||1);
  canvas.height = S * (window.devicePixelRatio||1);
  canvas.style.width = S+'px'; canvas.style.height = S+'px';

  let dispMag = 0;
  const MAX_ACC = 30;

  function draw(mag) {
    const dpr = window.devicePixelRatio||1;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const cx = S/2, cy = S/2, R = S/2 - 12;
    ctx.clearRect(0,0,S,S);
    const startA = Math.PI * 1.1, endA = Math.PI * 0.1;
    const sweep = (2*Math.PI - startA + endA);
    ctx.beginPath(); ctx.arc(cx,cy,R,startA,endA,false);
    ctx.strokeStyle = 'rgba(86,216,245,0.08)'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.stroke();
    const zones = [
      {from:0,to:0.33,color:'#00f5c4'},{from:0.33,to:0.67,color:'#f5d800'},{from:0.67,to:1,color:'#ff4e6a'}
    ];
    zones.forEach(z => {
      ctx.beginPath(); ctx.arc(cx,cy,R,startA+z.from*sweep,startA+z.to*sweep,false);
      ctx.strokeStyle = z.color+'44'; ctx.lineWidth = 12; ctx.lineCap = 'butt'; ctx.stroke();
    });
    const pct = Math.min(mag/MAX_ACC, 1);
    const fillEnd = startA + pct * sweep;
    const fc = mag < 10 ? '#00f5c4' : mag < 20 ? '#f5d800' : '#ff4e6a';
    ctx.save(); ctx.shadowColor = fc; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.arc(cx,cy,R,startA,fillEnd,false);
    ctx.strokeStyle = fc; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.stroke();
    ctx.restore();
    for (let v = 0; v <= MAX_ACC; v += 5) {
      const t2 = v/MAX_ACC;
      const ang = startA + t2*sweep;
      const major = v % 10 === 0;
      const inner = R - (major ? 14 : 8);
      ctx.beginPath();
      ctx.moveTo(cx+(R+1)*Math.cos(ang), cy+(R+1)*Math.sin(ang));
      ctx.lineTo(cx+inner*Math.cos(ang), cy+inner*Math.sin(ang));
      ctx.strokeStyle = major ? 'rgba(86,216,245,0.7)' : 'rgba(86,216,245,0.25)';
      ctx.lineWidth = major ? 1.5 : 0.8; ctx.stroke();
      if (major) {
        const lx = cx+(inner-10)*Math.cos(ang), ly = cy+(inner-10)*Math.sin(ang);
        ctx.font = `500 ${R*0.12}px DM Mono, monospace`;
        ctx.fillStyle = 'rgba(86,216,245,0.5)';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(v, lx, ly);
      }
    }
    const el = document.getElementById('csAccelMag');
    if (el) el.textContent = mag.toFixed(2);
    el && (el.style.color = fc);
    el && (el.style.textShadow = `0 0 16px ${fc}88`);
  }

  function anim() {
    requestAnimationFrame(anim);
    const target = Number(window._csAccelMagTarget) || 0;
    dispMag += (target - dispMag) * 0.08;
    draw(dispMag);
  }
  anim();
}
