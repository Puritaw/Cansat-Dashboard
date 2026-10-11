// js/telemetry/parser.js — Parse one text line (JSON or CSV) from Serial / WebSocket

function ingestLine(line) {
  if (!line) return;
  let obj = null;
  if (line[0] === '{') {
    try { obj = JSON.parse(line); } catch (_) { /* ไม่ใช่ JSON สมบูรณ์ */ }
  } else {
    const parts = line.split(',').map(s => s.trim());
    if (parts.length >= 2 && parts.every(p => p === '' || Number.isFinite(Number(p)))) {
      obj = {};
      TELEMETRY_CONFIG.csvFields.forEach((k, i) => { if (parts[i] !== undefined && parts[i] !== '') obj[k] = Number(parts[i]); });
    }
  }
  if (obj && typeof obj === 'object') handleTelemetry(obj, line);
  else appendRawLine(line);
}
