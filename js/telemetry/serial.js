// js/telemetry/serial.js — Transport 2: Web Serial (ESP over USB)

// =====================================================================
// Transport 2: Web Serial (ESP ต่อ USB กับเครื่องที่เปิดเว็บ) — ปุ่ม CONNECT SERIAL
// =====================================================================

async function connectSerial() {
  if (!('serial' in navigator)) {
    alert('Web Serial API ไม่รองรับ browser นี้\nใช้ Chrome หรือ Edge เวอร์ชันล่าสุดครับ');
    return;
  }
  try {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: TELEMETRY_CONFIG.serialBaud });
    setTransport('Serial @' + TELEMETRY_CONFIG.serialBaud, true);

    const decoder = new TextDecoderStream();
    port.readable.pipeTo(decoder.writable).catch(() => {});
    const reader = decoder.readable.getReader();

    let buffer = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop();
      lines.forEach(l => ingestLine(l.trim()));
    }
  } catch (err) {
    console.warn('Serial error:', err);
    appendRawLine('[SERIAL] ' + (err.message || err));
  } finally {
    setTransport('Serial', false);
  }
}
