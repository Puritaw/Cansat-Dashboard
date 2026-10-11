// js/ui/terminal.js — LoRa raw-data terminal

// ---- LoRa raw terminal (บรรทัดจริงที่รับจาก ESP เท่านั้น) ----
const loraEl = document.getElementById('loraTerminal');
function appendRawLine(text) {
  if (!loraEl) return;
  const ts = new Date().toISOString().substr(11, 8);
  const div = document.createElement('div');
  div.className = 'lora-line lora-new';
  const t = document.createElement('span'); t.className = 'lora-ts';   t.textContent = ts;
  const d = document.createElement('span'); d.className = 'lora-data'; d.textContent = text;
  div.append(t, d);
  loraEl.appendChild(div);
  while (loraEl.children.length > 60) loraEl.removeChild(loraEl.firstChild);
  loraEl.scrollTop = loraEl.scrollHeight;
}
