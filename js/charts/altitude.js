// js/charts/altitude.js — Altitude charts (Kalman + raw)

// ---- Shared chart defaults ----
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  scales: {
    x: {
      grid: { color: 'rgba(0,245,196,0.05)', lineWidth: 1 },
      ticks: { color: '#3a8070', font: { size: 8, family: 'DM Mono' }, maxTicksLimit: 6 }
    },
    y: {
      grid: { color: 'rgba(0,245,196,0.08)', lineWidth: 1 },
      ticks: { color: '#3a8070', font: { size: 8, family: 'DM Mono' }, maxTicksLimit: 5 }
    }
  }
};

// --- Kalman Altitude ---
const altKCtx = document.getElementById('altKalmanChart').getContext('2d');
const altKChart = new Chart(altKCtx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      data: [],
      borderColor: '#98FB98',
      borderWidth: 2,
      pointRadius: 0,
      fill: true,
      backgroundColor: (ctx) => {
        const g = ctx.chart.ctx.createLinearGradient(0,0,0,130);
        g.addColorStop(0,'rgba(152,251,152,0.22)');
        g.addColorStop(1,'rgba(152,251,152,0.01)');
        return g;
      },
      tension: 0.4
    }]
  },
  options: { ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min: 0 } }}
});

// --- Raw Altitude ---
const altRCtx = document.getElementById('altRawChart').getContext('2d');
const altRChart = new Chart(altRCtx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      data: [],
      borderColor: '#92E1FF',
      borderWidth: 1.5,
      pointRadius: 0,
      fill: true,
      backgroundColor: (ctx) => {
        const g = ctx.chart.ctx.createLinearGradient(0,0,0,130);
        g.addColorStop(0,'rgba(146,225,255,0.18)');
        g.addColorStop(1,'rgba(146,225,255,0.01)');
        return g;
      },
      tension: 0.2
    }]
  },
  options: chartDefaults
});

attachTooltip(document.getElementById('altKalmanChart'), altKChart, 'ALTITUDE (KALMAN)', 'm', '#98FB98');
attachTooltip(document.getElementById('altRawChart'),    altRChart, 'ALTITUDE (RAW)',    'm', '#92E1FF');
