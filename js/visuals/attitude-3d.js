// js/visuals/attitude-3d.js — Three.js 3D rocket attitude visualizer

// ===== ATTITUDE 3D VISUALIZER (Three.js) =====
(function() {
  const mount = document.getElementById('attitudeMount');

  let sRoll = 0, sPitch = 0, sYaw = 0;
  let tRoll = 0, tPitch = 0, tYaw = 0;   // ค่าเริ่มต้น = ระดับ จนกว่าจะได้ข้อมูลจริง

  window._rocketSetAttitude = function(r, p, y) {
    tRoll  = parseFloat(r) || 0;
    tPitch = parseFloat(p) || 0;
    tYaw   = parseFloat(y) || 0;
  };

  const scene    = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x00080f, 1);
  mount.appendChild(renderer.domElement);

  function resizeRenderer() {
    const W = mount.clientWidth, H = mount.clientHeight;
    if (W === 0 || H === 0) return;
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
  camera.position.set(0, 0, 6);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0x1a3a4a, 0.6));

  const keyLight = new THREE.DirectionalLight(0x98fbd0, 1.4);
  keyLight.position.set(3, 5, 4);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x92e1ff, 0.5);
  fillLight.position.set(-4, 0, 2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x007fff, 0.35);
  rimLight.position.set(0, -3, -5);
  scene.add(rimLight);

  const engineGlow = new THREE.PointLight(0xff6010, 1.8, 3.5);
  engineGlow.position.set(0, -1.8, 0);
  scene.add(engineGlow);

  const bodyMat  = new THREE.MeshPhongMaterial({ color:0x1a7a50, emissive:0x062515, specular:0x66ffbb, shininess:80 });
  const noseMat  = new THREE.MeshPhongMaterial({ color:0x98fb98, emissive:0x10401a, specular:0xccffee, shininess:120 });
  const finMat   = new THREE.MeshPhongMaterial({ color:0x0a5535, emissive:0x021508, specular:0x44ffaa, shininess:60, side:THREE.DoubleSide });
  const windowMat= new THREE.MeshPhongMaterial({ color:0x92e1ff, emissive:0x1a4060, specular:0xffffff, shininess:200, transparent:true, opacity:0.85 });
  const nozzleMat= new THREE.MeshPhongMaterial({ color:0x222222, emissive:0x300a00, specular:0x888888, shininess:40 });
  const bandMat  = new THREE.MeshPhongMaterial({ color:0x007755, emissive:0x001a0d, specular:0x33ff99, shininess:50 });

  const rocket = new THREE.Group();
  scene.add(rocket);

  const bodyGeo = new THREE.CylinderGeometry(0.38, 0.38, 2.4, 32, 1);
  const body    = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  rocket.add(body);

  const noseGeo = new THREE.ConeGeometry(0.38, 1.1, 32);
  const nose    = new THREE.Mesh(noseGeo, noseMat);
  nose.position.y = 2.4 / 2 + 1.1 / 2;
  nose.castShadow = true;
  rocket.add(nose);

  const tipGeo = new THREE.SphereGeometry(0.06, 12, 12);
  const tip    = new THREE.Mesh(tipGeo, noseMat);
  tip.position.y = nose.position.y + 0.55;
  rocket.add(tip);

  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.40, 0.06, 32), bandMat);
  collar.position.y = 2.4 / 2;
  rocket.add(collar);

  const midBand = new THREE.Mesh(new THREE.CylinderGeometry(0.385, 0.385, 0.05, 32), bandMat);
  midBand.position.y = 0.2;
  rocket.add(midBand);

  const botBand = new THREE.Mesh(new THREE.CylinderGeometry(0.385, 0.385, 0.05, 32), bandMat);
  botBand.position.y = -0.9;
  rocket.add(botBand);

  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 0.4, 24, 1, true), nozzleMat);
  nozzle.position.y = -2.4 / 2 - 0.18;
  rocket.add(nozzle);

  const nCap = new THREE.Mesh(new THREE.CircleGeometry(0.38, 24), nozzleMat);
  nCap.rotation.x = -Math.PI / 2;
  nCap.position.y = -2.4 / 2 - 0.38;
  rocket.add(nCap);

  for (let i = 0; i < 3; i++) {
    const a   = (i / 3) * Math.PI * 2;
    const w   = new THREE.Mesh(new THREE.CircleGeometry(0.07, 12), windowMat);
    w.position.set(Math.cos(a) * 0.39, 0.5, Math.sin(a) * 0.39);
    w.lookAt(Math.cos(a) * 2, 0.5, Math.sin(a) * 2);
    rocket.add(w);
  }

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(0.55, -0.6);
    finShape.lineTo(0.55, -1.1);
    finShape.lineTo(0, -0.5);
    finShape.closePath();

    const group = new THREE.Group();
    group.rotation.y = angle;

    const fin  = new THREE.Mesh(new THREE.ShapeGeometry(finShape), finMat);
    fin.castShadow = true;
    fin.position.set(0.38, -2.4 / 2 + 0.5, 0);
    fin.rotation.y = Math.PI / 2;
    group.add(fin);

    const fin2 = new THREE.Mesh(new THREE.ShapeGeometry(finShape), finMat);
    fin2.position.set(0.38, -2.4 / 2 + 0.5, 0.02);
    fin2.rotation.y = Math.PI / 2;
    group.add(fin2);

    rocket.add(group);
  }

  const axisGroup = new THREE.Group();
  scene.add(axisGroup);

  function makeArrow(dir, color) {
    const mat = new THREE.MeshBasicMaterial({ color });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.9, 8), mat);
    const head  = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.18, 8), mat);
    const g = new THREE.Group();
    shaft.position.y = 0.45;
    head.position.y  = 0.9 + 0.09;
    g.add(shaft); g.add(head);
    if (dir === 'x') g.rotation.z = -Math.PI / 2;
    if (dir === 'z') g.rotation.x =  Math.PI / 2;
    axisGroup.add(g);
    return g;
  }

  makeArrow('x', 0xff4e6a);
  makeArrow('y', 0x98fb98);
  makeArrow('z', 0x92e1ff);
  axisGroup.position.set(1.4, -1.4, 0);
  axisGroup.scale.setScalar(0.55);

  const horizonGeo = new THREE.RingGeometry(1.1, 1.12, 64);
  const horizonMat = new THREE.MeshBasicMaterial({ color:0xf5d800, transparent:true, opacity:0.18, side:THREE.DoubleSide });
  const horizon = new THREE.Mesh(horizonGeo, horizonMat);
  horizon.rotation.x = Math.PI / 2;
  scene.add(horizon);

  const particleCount = 60;
  const pPositions = new Float32Array(particleCount * 3);
  const pVelocities = [];
  const pLife = [];
  for (let i = 0; i < particleCount; i++) {
    pVelocities.push({ x:(Math.random()-0.5)*0.04, y:-(0.02+Math.random()*0.06), z:(Math.random()-0.5)*0.04 });
    pLife.push(Math.random());
    pPositions[i*3]=0; pPositions[i*3+1]=-2.8; pPositions[i*3+2]=0;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  const pMat = new THREE.PointsMaterial({ color:0xff7020, size:0.08, transparent:true, opacity:0.85, sizeAttenuation:true });
  const particles = new THREE.Points(pGeo, pMat);
  rocket.add(particles);

  const starCount = 300;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPos[i*3]=(Math.random()-0.5)*40; starPos[i*3+1]=(Math.random()-0.5)*40; starPos[i*3+2]=(Math.random()-0.5)*40-5;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color:0xaaddff, size:0.04, transparent:true, opacity:0.6 })));

  const gridHelper = new THREE.GridHelper(6, 12, 0x1a4a3a, 0x0a2a1a);
  gridHelper.position.y = -2.5;
  scene.add(gridHelper);

  function updateArc(pathId, valueNorm) {
    const el = document.getElementById(pathId);
    if (!el) return;
    const cx=18, cy=16, R=16;
    const pct=Math.max(0,Math.min(1,(valueNorm+1)/2));
    if (pct<0.01){el.setAttribute('d',`M${cx-R},${cy} A0,0 0 0,1 ${cx-R},${cy}`);return;}
    const a=Math.PI+pct*Math.PI;
    const x=cx+R*Math.cos(a), y=cy+R*Math.sin(a);
    const large=pct>0.5?1:0;
    el.setAttribute('d',`M${cx-R},${cy} A${R},${R} 0 ${large},1 ${x.toFixed(2)},${y.toFixed(2)}`);
  }

  let prevTime = performance.now();

  function animate() {
    requestAnimationFrame(animate);
    const now=performance.now(), dt=Math.min((now-prevTime)/1000,0.05);
    prevTime=now;

    const a=1-Math.pow(0.04,dt);

    sRoll+=(tRoll-sRoll)*a; sPitch+=(tPitch-sPitch)*a; sYaw+=(tYaw-sYaw)*a;

    rocket.rotation.set(sPitch*Math.PI/180, sYaw*Math.PI/180, sRoll*Math.PI/180, 'ZXY');
    engineGlow.intensity=1.5+Math.sin(now*0.008)*0.5+Math.random()*0.3;

    const pos=pGeo.attributes.position.array;
    for(let i=0;i<particleCount;i++){
      pLife[i]-=dt*1.5;
      if(pLife[i]<=0){
        pLife[i]=1.0;
        pos[i*3]=(Math.random()-0.5)*0.12;
        pos[i*3+1]=-1.25;
        pos[i*3+2]=(Math.random()-0.5)*0.12;
        pVelocities[i]={x:(Math.random()-0.5)*0.04,y:-(0.02+Math.random()*0.06),z:(Math.random()-0.5)*0.04};
      }
      pos[i*3]+=pVelocities[i].x; pos[i*3+1]+=pVelocities[i].y; pos[i*3+2]+=pVelocities[i].z;
    }
    pGeo.attributes.position.needsUpdate=true;
    pMat.opacity=0.7+Math.sin(now*0.01)*0.2;
    pMat.color.setHSL(0.07+Math.sin(now*0.003)*0.02,1.0,0.55);

    // ตัวเลข roll/pitch/yaw ถูกอัปเดตจาก telemetry handler
    updateArc('rollArcFill',  sRoll/180);
    updateArc('pitchArcFill', sPitch/90);
    updateArc('yawArcFill',   sYaw/180);

    resizeRenderer();
    renderer.render(scene, camera);
  }

  setTimeout(() => { resizeRenderer(); animate(); }, 120);
  if(window.ResizeObserver) new ResizeObserver(resizeRenderer).observe(mount);
})();
