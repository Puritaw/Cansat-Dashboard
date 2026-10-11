// js/charts/data-loss.js — Data-loss scatter chart with regression line and horizontal scroll

// ============================================================
// DATA LOSS RATE — Scatter Plot + Linear Regression (FIXED)
// ============================================================

let lossPoints = [];

function calcRegression(pts) {
  const n = pts.length;
  if (n < 2) return { m: 0, b: 0 };
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  pts.forEach(p => { sumX += p.x; sumY += p.y; sumXY += p.x * p.y; sumX2 += p.x * p.x; });
  const denom = (n * sumX2 - sumX * sumX);
  if (denom === 0) return { m: 0, b: sumY / n };
  const m = (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - m * sumX) / n;
  return { m, b };
}

function getRegressionLine(pts) {
  if (pts.length < 2) return [];
  const { m, b } = calcRegression(pts);
  const xs = pts.map(p => p.x);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  return [{ x: xMin, y: m * xMin + b }, { x: xMax, y: m * xMax + b }];
}

const lossCanvas = document.getElementById('dataLossLinearChart');
const lossInner  = document.getElementById('lossScrollInner');
const lossOuter  = document.getElementById('lossScrollOuter');

const LOSS_PX_PER_UNIT   = 6;
const LOSS_MIN_WIDTH     = 600;
const LOSS_CANVAS_HEIGHT = 130;

let dataLossLinearChart = null;

function initLossChart() {
  // Use fixed height constant — never read clientHeight before layout is stable
  lossCanvas.width        = LOSS_MIN_WIDTH;
  lossCanvas.height       = LOSS_CANVAS_HEIGHT;
  lossCanvas.style.width  = LOSS_MIN_WIDTH + 'px';
  lossCanvas.style.height = LOSS_CANVAS_HEIGHT + 'px';
  lossInner.style.width   = LOSS_MIN_WIDTH + 'px';
  lossInner.style.height  = LOSS_CANVAS_HEIGHT + 'px';

  if (dataLossLinearChart) {
    dataLossLinearChart.destroy();
    dataLossLinearChart = null;
  }

  const ctx = lossCanvas.getContext('2d');

  dataLossLinearChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Loss %',
          data: [],
          backgroundColor: 'rgba(255,78,106,0.85)',
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBorderWidth: 0,
          order: 2
        },
        {
          label: 'Trend',
          data: [],
          type: 'line',
          borderColor: 'rgba(146,225,255,0.60)',
          borderWidth: 2,
          backgroundColor: 'rgba(146,225,255,0.07)',
          fill: false,
          pointRadius: 0,
          tension: 0,
          order: 1
        }
      ]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: {
          type: 'linear',
          min: 0,
          max: 100,
          grid:  { color: 'rgba(0,245,196,0.05)', lineWidth: 1 },
          ticks: { color: '#3a8070', font: { size: 8, family: 'DM Mono' }, stepSize: 50 }
        },
        y: {
          min: 0,
          max: 5,
          grid:  { color: 'rgba(0,245,196,0.08)', lineWidth: 1 },
          ticks: { color: '#3a8070', font: { size: 8, family: 'DM Mono' }, stepSize: 1 }
        }
      }
    }
  });

  attachScatterTooltip();
}

// Resize canvas width only when data grows — never touch height
function resizeLossChart() {
  if (!dataLossLinearChart || lossPoints.length === 0) return;
  const maxX = Math.max(...lossPoints.map(p => p.x));
  const newWidth = Math.max(LOSS_MIN_WIDTH, maxX * LOSS_PX_PER_UNIT + 80);
  const curWidth = parseInt(lossCanvas.style.width) || LOSS_MIN_WIDTH;
  if (newWidth === curWidth) return; // no change needed

  dataLossLinearChart.options.scales.x.max = Math.max(100, maxX + 30);
  dataLossLinearChart.resize(newWidth, LOSS_CANVAS_HEIGHT);
  lossCanvas.style.width = newWidth + 'px';
  lossInner.style.width  = newWidth + 'px';

  if (!lossOuter._userScrolling) {
    lossOuter.scrollLeft = lossOuter.scrollWidth;
  }
}

// Detect user manually scrolling away from right edge
let userScrollTimer = null;
lossOuter.addEventListener('scroll', () => {
  lossOuter._userScrolling = true;
  clearTimeout(userScrollTimer);
  userScrollTimer = setTimeout(() => {
    const distFromRight = lossOuter.scrollWidth - lossOuter.scrollLeft - lossOuter.clientWidth;
    if (distFromRight < 60) lossOuter._userScrolling = false;
  }, 2000);
});

// Drag-to-scroll
(function attachDragScroll(el) {
  let isDragging = false, startX = 0, startScroll = 0;
  el.addEventListener('mousedown', e => {
    isDragging = true; startX = e.clientX; startScroll = el.scrollLeft;
    el.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    el.scrollLeft = startScroll - (e.clientX - startX);
    lossOuter._userScrolling = true;
    clearTimeout(userScrollTimer);
  });
  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    el.style.cursor = 'grab';
    const dist = el.scrollWidth - el.scrollLeft - el.clientWidth;
    if (dist < 60) lossOuter._userScrolling = false;
  });
})(lossOuter);

// Scatter tooltip — attach once, guard against double-attach
let _scatterTooltipAttached = false;
function attachScatterTooltip() {
  if (_scatterTooltipAttached) return;
  _scatterTooltipAttached = true;

  lossCanvas.addEventListener('mousemove', e => {
    if (!dataLossLinearChart) return;
    const rect = lossCanvas.getBoundingClientRect();
    dataLossLinearChart._hoverX = e.clientX - rect.left;
    dataLossLinearChart.draw();

    // intersect:true so we only hit actual scatter dots, not the trend line
    const pts = dataLossLinearChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
    const hit = pts.find(p => p.datasetIndex === 0);
    if (!hit) { hideTooltip(); return; }

    const raw = dataLossLinearChart.data.datasets[0].data[hit.index];
    if (!raw) { hideTooltip(); return; }

    tooltipLabel.textContent = 'DATA LOSS RATE';
    tooltipValue.textContent = raw.y.toFixed(2) + ' %';
    tooltipValue.style.color = '#ff4e6a';
    tooltipValue.style.textShadow = '0 0 12px #ff4e6a88';
    tooltipSub.textContent = 'T+' + raw.x + 's';

    const margin = 14;
    let x = e.clientX + margin, y = e.clientY - 48;
    if (x + 140 > window.innerWidth - 8)  x = e.clientX - 140 - margin;
    if (y < 8)                             y = e.clientY + margin;
    if (y + 72 > window.innerHeight - 8)   y = window.innerHeight - 80;

    tooltipEl.style.left    = x + 'px';
    tooltipEl.style.top     = y + 'px';
    tooltipEl.style.display = 'block';
    tooltipEl.style.opacity = '1';
    clearTimeout(tooltipHideTimer);
  });

  lossCanvas.addEventListener('mouseleave', () => {
    if (!dataLossLinearChart) return;
    dataLossLinearChart._hoverX = null;
    dataLossLinearChart.draw();
    hideTooltip();
  });
}

// Init after layout settles (double rAF = after first paint)
requestAnimationFrame(() => requestAnimationFrame(initLossChart));

// On window resize — just resize the existing chart, don't rebuild
let lossResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(lossResizeTimer);
  lossResizeTimer = setTimeout(() => {
    if (dataLossLinearChart) {
      const curWidth = parseInt(lossCanvas.style.width) || LOSS_MIN_WIDTH;
      dataLossLinearChart.resize(curWidth, LOSS_CANVAS_HEIGHT);
    }
  }, 200);
});

// ============================================================
