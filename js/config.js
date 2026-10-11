// js/config.js — Configuration (transport settings, Firebase project)

const TELEMETRY_CONFIG = {
  firebasePath: '/naga/latest',
  // ต่อ ESP ตรงผ่าน WebSocket: เปิดหน้าเว็บด้วย  ?ws=ws://192.168.4.1:81
  wsUrl:      new URLSearchParams(location.search).get('ws') || '',
  // baud ต้องตรงกับ Serial.begin() ใน ESP  (เปลี่ยนชั่วคราวได้ด้วย ?baud=115200)
  serialBaud: parseInt(new URLSearchParams(location.search).get('baud')) || 9600,
  staleMs: 3000,            // ไม่มีแพ็กเกจเกินนี้ = SIGNAL LOST
  maxChartPoints: 120,      // จำนวนจุดสูงสุดของกราฟความสูง
  maxLossPoints: 3000,
  csvFields: ['alt', 'alt_raw', 'lat', 'lon', 'rssi', 'roll', 'pitch', 'yaw', 'speed', 'loss']
};

const firebaseConfig = {
  apiKey: "AIzaSyCjgCb7eJEIbzrTaej2IrihPT2IXBNXknU",
  authDomain: "naga-cansat-26472.firebaseapp.com",
  databaseURL: "https://naga-cansat-26472-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "naga-cansat-26472",
  storageBucket: "naga-cansat-26472.firebasestorage.app",
  messagingSenderId: "460079322130",
  appId: "1:460079322130:web:a65f5e98ccf5bb77caf4cb",
  measurementId: "G-14LDHLFKWG"
};
