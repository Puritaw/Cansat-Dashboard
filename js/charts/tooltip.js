// js/charts/tooltip.js — Chart crosshair + floating tooltip

// ---- Custom crosshair + tooltip ----
const tooltipEl = document.createElement('div');
tooltipEl.id = 'chartTooltip';
tooltipEl.style.cssText = `
  position: fixed;
  pointer-events: none;
  z-index: 9990;
  display: none;
  background: rgba(3, 14, 26, 0.82);
  border: 1px solid rgba(146,225,255,0.30);
  border-radius: 8px;
  padding: 7px 11px;
  backdrop-filter: blur(12px);
  box-shadow: 0 0 18px rgba(0,245,196,0.12), inset 0 0 0 1px rgba(152,251,152,0.06);
  min-width: 110px;
  transition: opacity 0.12s;
`;
document.body.appendChild(tooltipEl);

['tl','tr','bl','br'].forEach(pos => {
  const d = document.createElement('div');
  const isTop = pos.includes('t'), isLeft = pos.includes('l');
  d.style.cssText = `
    position:absolute;width:8px;height:8px;
    ${isTop ? 'top:4px' : 'bottom:4px'};
    ${isLeft ? 'left:4px' : 'right:4px'};
    border-color:rgba(0,245,196,0.45);border-style:solid;
    border-width:${isTop?'1px 0 0':'0 0 1px'} ${isLeft?'0 0 0 1px':'0 1px 0 0'};
  `;
  tooltipEl.appendChild(d);
});

const tooltipLabel  = document.createElement('div');
tooltipLabel.style.cssText = 'font-size:9px;color:rgba(146,225,255,0.55);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:4px;font-family:"DM Mono",monospace;';
const tooltipValue  = document.createElement('div');
tooltipValue.style.cssText = 'font-family:"Orbitron",monospace;font-size:16px;font-weight:700;line-height:1;';
const tooltipSub    = document.createElement('div');
tooltipSub.style.cssText = 'font-size:8px;color:rgba(146,225,255,0.40);margin-top:3px;font-family:"DM Mono",monospace;letter-spacing:1px;';
tooltipEl.appendChild(tooltipLabel);
tooltipEl.appendChild(tooltipValue);
tooltipEl.appendChild(tooltipSub);

let tooltipHideTimer = null;

function showChartTooltip(e, chart, label, unit, color) {
  const points = chart.getElementsAtEventForMode(e, 'index', { intersect: false }, true);
  if (!points.length) { hideTooltip(); return; }
  const idx = points[0].index;
  const raw = chart.data.datasets[0].data[idx];
  if (raw === undefined || raw === null) { hideTooltip(); return; }

  const val = typeof raw === 'number' ? raw.toFixed(2) : raw;
  const tick = chart.data.labels[idx];

  tooltipLabel.textContent  = label;
  tooltipValue.textContent  = val + ' ' + unit;
  tooltipValue.style.color  = color;
  tooltipValue.style.textShadow = `0 0 12px ${color}88`;
  tooltipSub.textContent    = 'T+' + tick + 's';

  const margin = 14;
  let x = e.clientX + margin;
  let y = e.clientY - 48;
  const tw = 140, th = 72;
  if (x + tw > window.innerWidth  - 8) x = e.clientX - tw - margin;
  if (y < 8)                           y = e.clientY + margin;
  if (y + th > window.innerHeight - 8) y = window.innerHeight - th - 8;

  tooltipEl.style.left    = x + 'px';
  tooltipEl.style.top     = y + 'px';
  tooltipEl.style.display = 'block';
  tooltipEl.style.opacity = '1';

  clearTimeout(tooltipHideTimer);
}

function hideTooltip() {
  tooltipHideTimer = setTimeout(() => {
    tooltipEl.style.display = 'none';
  }, 80);
}

const crosshairPlugin = {
  id: 'crosshair',
  afterDraw(chart) {
    if (!chart._hoverX) return;
    const { ctx, chartArea: { top, bottom } } = chart;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(chart._hoverX, top);
    ctx.lineTo(chart._hoverX, bottom);
    ctx.strokeStyle = 'rgba(146,225,255,0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
};
Chart.register(crosshairPlugin);

function attachTooltip(canvas, chart, label, unit, color) {
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    chart._hoverX = x;
    chart.draw();
    showChartTooltip(e, chart, label, unit, color);
  });
  canvas.addEventListener('mouseleave', () => {
    chart._hoverX = null;
    chart.draw();
    hideTooltip();
  });
}
