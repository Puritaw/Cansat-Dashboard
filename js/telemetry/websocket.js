// js/telemetry/websocket.js — Transport 3: WebSocket straight to ESP

// =====================================================================
// Transport 3: WebSocket ตรงไป ESP (เปิดเว็บด้วย ?ws=ws://<ip ของ ESP>:81)
// =====================================================================
function startWebSocket() {
  const url = TELEMETRY_CONFIG.wsUrl;
  if (!url) return;
  let retryMs = 1000;
  (function connect() {
    const ws = new WebSocket(url);
    ws.onopen    = () => { retryMs = 1000; setTransport('WebSocket ' + url, true); appendRawLine('[WS] connected ' + url); };
    ws.onmessage = ev => String(ev.data).split(/\r?\n/).forEach(l => ingestLine(l.trim()));
    ws.onerror   = () => ws.close();
    ws.onclose   = () => {
      setTransport('WebSocket', false);
      setTimeout(connect, retryMs);
      retryMs = Math.min(retryMs * 2, 10000);
    };
  })();
}
