// js/telemetry/firebase.js — Transport 1: Firebase Realtime Database

// =====================================================================
// Transport 1: Firebase Realtime Database  (ESP -> WiFi -> Firebase -> เว็บ)
// =====================================================================
function startFirebase() {
  if (typeof firebase === 'undefined') {
    console.warn('[Firebase] SDK ไม่ถูกโหลด (ออฟไลน์?) — ข้าม; ใช้ Serial/WebSocket แทนได้');
    return;
  }
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();

  let firstSnapshot = true;
  db.ref(TELEMETRY_CONFIG.firebasePath).on('value', snap => {
    const data = snap.val();
    // snapshot แรกคือค่าที่ค้างอยู่ใน DB (อาจเก่า) ไม่ใช่ข้อมูลสด -> ไม่เอามาแสดงเป็น LIVE
    if (firstSnapshot) {
      firstSnapshot = false;
      if (data) appendRawLine('[RTDB] ข้ามแพ็กเกจล่าสุดที่ค้างอยู่ (ไม่ใช่ข้อมูลสด)');
      return;
    }
    if (data && typeof data === 'object') handleTelemetry(data, JSON.stringify(data));
  }, err => {
    console.error('[Firebase] read error:', err);
    appendRawLine('[RTDB] error: ' + (err.code || err.message));
    setTransport('Firebase (' + (err.code || 'error') + ')', false);
  });

  db.ref('.info/connected').on('value', s => setTransport('Firebase', !!s.val()));
}
