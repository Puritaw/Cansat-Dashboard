// js/visuals/hologram.js — Background snake-scale hologram

// ===== SNAKE SCALE HOLOGRAM =====
(function() {
  const canvas = document.getElementById('holoCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildGroups();
  }
  window.addEventListener('resize', resize);

  function drawScale(cx, cy, sw, sh, brightness, alpha) {
    const hw=sw*0.50, hh=sh*0.54;
    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(Math.PI/2);
    const r=Math.round(0+152*brightness), g=Math.round(127+124*brightness), b=Math.round(255-103*brightness);
    const fillA=alpha*(0.06+0.10*brightness), strokeA=alpha*(0.18+0.24*brightness), glowA=alpha*Math.max(0,brightness*0.65);
    ctx.beginPath();
    ctx.moveTo(0,-hh);
    ctx.bezierCurveTo(hw*0.6,-hh*0.6,hw,-hh*0.1,hw,hh*0.4);
    ctx.bezierCurveTo(hw*0.5,hh,-hw*0.5,hh,-hw,hh*0.4);
    ctx.bezierCurveTo(-hw,-hh*0.1,-hw*0.6,-hh*0.6,0,-hh);
    ctx.closePath();
    ctx.fillStyle=`rgba(${r},${g},${b},${fillA})`;
    ctx.fill();
    ctx.strokeStyle=`rgba(${r},${g},${b},${strokeA})`;
    ctx.lineWidth=0.7;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-hw*0.48,-hh*0.26);
    ctx.quadraticCurveTo(0,-hh*0.80,hw*0.48,-hh*0.26);
    ctx.strokeStyle=`rgba(${r},${g},${b},${glowA})`;
    ctx.lineWidth=1.0;
    ctx.stroke();
    ctx.restore();
  }

  let groups=[];

  function buildGroups(){
    groups=[];
    const COLS=5,ROWS=4;
    const zoneW=W/COLS,zoneH=H/ROWS;
    for(let row=0;row<ROWS;row++){
      for(let col=0;col<COLS;col++){
        const jx=(Math.random()*0.6+0.2)*zoneW, jy=(Math.random()*0.6+0.2)*zoneH;
        const cx=col*zoneW+jx, cy=row*zoneH+jy;
        const gW=3+Math.floor(Math.random()*3), gH=3+Math.floor(Math.random()*3);
        const sw=13+Math.random()*7, sh=sw*0.62;
        const spd=0.010+Math.random()*0.012, ph=Math.random()*Math.PI*2;
        const breathSpd=0.007+Math.random()*0.008, breathPh=Math.random()*Math.PI*2;
        groups.push({cx,cy,gW,gH,sw,sh,spd,ph,breathSpd,breathPh});
      }
    }
  }

  function renderGroup(g){
    const{cx,cy,gW,gH,sw,sh,spd,ph,breathSpd,breathPh}=g;
    const pitchX=sh*1.05,pitchY=sw*0.72;
    const totalW=gW*pitchX,totalH=gH*pitchY;
    const breath=0.4+0.6*(0.5+0.5*Math.sin(t*breathSpd+breathPh));
    for(let r=0;r<gH;r++){
      const stagger=(r%2===0)?0:pitchX*0.5;
      for(let c=0;c<gW;c++){
        const sx=cx+c*pitchX+stagger-totalW*0.5, sy=cy+r*pitchY-totalH*0.5;
        const w1=Math.sin(t*spd*3.5+c*0.60+r*0.45+ph);
        const w2=Math.sin(t*spd*2.2-c*0.44-r*0.38+ph+1.8);
        const brightness=(w1+w2)*0.5*0.5+0.5;
        drawScale(sx,sy,sw,sh,brightness,breath);
      }
    }
  }

  function render(){
    ctx.clearRect(0,0,W,H);
    groups.forEach(renderGroup);
    t+=1;
    requestAnimationFrame(render);
  }

  resize();
  render();
})();
