// js/cansat/gyro-axes.js — CanSat 3D wireframe orientation box

// ---- 1. 3D Wireframe Box ----
function initGyroAxes() {
  const canvas = document.getElementById('gyroAxesCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let roll = 0, pitch = 0, yaw = 0;

  function resize() {
    const p = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = p.clientWidth  * dpr;
    canvas.height = p.clientHeight * dpr;
    canvas.style.width  = p.clientWidth  + 'px';
    canvas.style.height = p.clientHeight + 'px';
  }
  resize();
  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas.parentElement);

  function rotate3D(x, y, z) {
    const cr = Math.cos(roll), sr = Math.sin(roll);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const cy2 = Math.cos(yaw), sy = Math.sin(yaw);
    let x1 = cy2*x + sy*z, z1 = -sy*x + cy2*z, y1 = y;
    let y2 = cp*y1 - sp*z1, z2 = sp*y1 + cp*z1, x2 = x1;
    let x3 = cr*x2 - sr*y2, y3 = sr*x2 + cr*y2;
    return [x3, y3, z2];
  }

  function project(x, y, z) {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr, H = canvas.height / dpr;
    const fov = 5.5;
    const scale = fov / (fov + z);
    const size = Math.min(W, H) * 0.26;
    return { sx: W/2 + x * size * scale, sy: H/2 - y * size * scale, z: z };
  }

  const verts3D = [
    [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
    [-1,-1, 1],[1,-1, 1],[1,1, 1],[-1,1, 1],
  ];
  const edges = [
    [0,1],[1,2],[2,3],[3,0],
    [4,5],[5,6],[6,7],[7,4],
    [0,4],[1,5],[2,6],[3,7],
  ];
  const faces = [
    { verts:[4,5,6,7], color:'rgba(167,139,250,0.12)' },
    { verts:[0,1,2,3], color:'rgba(146,225,255,0.07)' },
    { verts:[3,2,6,7], color:'rgba(152,251,152,0.07)' },
    { verts:[0,1,5,4], color:'rgba(255,140,66,0.05)'  },
    { verts:[1,2,6,5], color:'rgba(86,216,245,0.06)'  },
    { verts:[0,3,7,4], color:'rgba(167,139,250,0.05)' },
  ];

  function drawBox() {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr, H = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#020c18'); bg.addColorStop(1, '#030e20');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(146,225,255,0.04)'; ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    const projected = verts3D.map(([x,y,z]) => {
      const [rx,ry,rz] = rotate3D(x, y, z);
      return project(rx, ry, rz);
    });

    const sortedFaces = faces.map(f => ({
      ...f,
      avgZ: f.verts.reduce((s,i) => s + projected[i].z, 0) / f.verts.length
    })).sort((a,b) => a.avgZ - b.avgZ);

    sortedFaces.forEach(f => {
      const pts = f.verts.map(i => projected[i]);
      ctx.beginPath();
      ctx.moveTo(pts[0].sx, pts[0].sy);
      pts.slice(1).forEach(p => ctx.lineTo(p.sx, p.sy));
      ctx.closePath();
      ctx.fillStyle = f.color;
      ctx.fill();
    });

    edges.forEach(([a, b]) => {
      const pa = projected[a], pb = projected[b];
      const avgZ = (pa.z + pb.z) / 2;
      const alpha = 0.35 + (avgZ + 2) / 4 * 0.5;
      ctx.beginPath();
      ctx.moveTo(pa.sx, pa.sy);
      ctx.lineTo(pb.sx, pb.sy);
      ctx.strokeStyle = `rgba(167,139,250,${Math.min(0.9, Math.max(0.15, alpha))})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    const axesDef = [
      { dir:[1,0,0], color:'#ff4e6a', label:'X' },
      { dir:[0,1,0], color:'#98FB98', label:'Y' },
      { dir:[0,0,-1], color:'#92E1FF', label:'Z' },
    ];
    axesDef.forEach(ax => {
      const [rx,ry,rz] = rotate3D(...ax.dir.map(v => v*1.65));
      const tip = project(rx, ry, rz);
      const [bx,by,bz] = rotate3D(...ax.dir.map(v => -v*0.3));
      const base = project(bx, by, bz);
      const orig = project(0, 0, 0);

      ctx.save();
      ctx.shadowColor = ax.color; ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(base.sx, base.sy);
      ctx.lineTo(tip.sx, tip.sy);
      ctx.strokeStyle = ax.color;
      ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();

      const ang = Math.atan2(tip.sy - orig.sy, tip.sx - orig.sx);
      ctx.beginPath();
      ctx.moveTo(tip.sx, tip.sy);
      ctx.lineTo(tip.sx - 10*Math.cos(ang-0.4), tip.sy - 10*Math.sin(ang-0.4));
      ctx.lineTo(tip.sx - 10*Math.cos(ang+0.4), tip.sy - 10*Math.sin(ang+0.4));
      ctx.closePath();
      ctx.fillStyle = ax.color; ctx.fill();
    });

    const o = project(0,0,0);
    ctx.beginPath(); ctx.arc(o.sx, o.sy, 3, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill();
  }

  function animateAxes() {
    requestAnimationFrame(animateAxes);
    const r = parseFloat(document.getElementById('gyroRollDisp')?.textContent)  || 0;
    const p = parseFloat(document.getElementById('gyroPitchDisp')?.textContent) || 0;
    const y = parseFloat(document.getElementById('gyroYawDisp')?.textContent)   || 0;

    roll  += (r * Math.PI/180 - roll)  * 0.06;
    pitch += (p * Math.PI/180 - pitch) * 0.06;
    yaw   += (y * Math.PI/180 - yaw)   * 0.06;

    drawBox();
  }
  animateAxes();
}
