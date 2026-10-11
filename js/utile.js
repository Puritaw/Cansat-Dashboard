// js/utils.js — Small DOM / number helpers shared by all modules

// ---- helpers ----
const $el = id => document.getElementById(id);
const setText = (id, v) => { const e = $el(id); if (e) e.textContent = v; };
const setWidth = (id, w) => { const e = $el(id); if (e) e.style.width = w; };
const num = v => {                       // แปลงเป็นตัวเลข; ไม่ใช่ตัวเลข -> undefined
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v;
  return (typeof n === 'number' && Number.isFinite(n)) ? n : undefined;
};
const bool = v => v === undefined ? undefined : (v === true || v === 1 || v === '1' || v === 'true');
