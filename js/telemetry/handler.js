// js/telemetry/handler.js — handleTelemetry(): one packet -> every widget (see data format below)

// =====================================================================
// TELEMETRY PIPELINE — รับข้อมูลจริงจาก ESP (ไม่มี mock / simulation)
// =====================================================================
// ทุก transport (Firebase / Web Serial / WebSocket) ส่งเข้า handleTelemetry() ตัวเดียว
//
// รูปแบบข้อมูลที่ ESP ต้องส่ง (JSON, field ไหนไม่มีก็ข้ามได้):
//   {
//     "seq": 123,                      // เลขแพ็กเกจ (ใช้คำนวณ data loss ถ้าไม่ส่ง "loss")
//     "lat": 13.575199, "lon": 100.571475, "gps_valid": true, "sats": 8,
//     "alt": 120.4,                    // Kalman (m)
//     "alt_raw": 121.9,                // raw   (m)
//     "speed": 35.2,                   // m/s (ถ้าไม่ส่ง จะคำนวณจาก alt)
//     "roll": 1.2, "pitch": -3.4, "yaw": 90.0,        // °
//     "gx": 0.1, "gy": 0.2, "gz": 0.3,                // °/s
//     "ax": 0.1, "ay": 0.2, "az": 9.8,                // m/s²
//     "voltage": 3.7, "ampere": 320, "ohm": 11.5,     // V, mA, Ω (ohm ไม่ส่งก็คำนวณให้)
//     "rssi": -107, "loss": 1.5,                      // dBm, %
//     "temp": 38.2, "fusion_hz": 100, "range_km": 4.2, "backup": true   // optional
//   }
//
// Serial / WebSocket รับได้ 2 แบบ ต่อ 1 บรรทัด:
//   1) JSON  ->  {"alt":120.4,"lat":13.57,...}
//   2) CSV   ->  ALT_K,ALT_R,LAT,LON,RSSI,ROLL,PITCH,YAW,SPEED,LOSS   (ลำดับตาม csvFields)
// บรรทัดที่ parse ไม่ได้ (เช่น boot log ของ ESP) จะโชว์ใน LoRa terminal เฉยๆ
// =====================================================================

// =====================================================================
// handleTelemetry — อัปเดตทุก widget จากแพ็กเกจเดียว
// =====================================================================
function handleTelemetry(raw, rawText) {
  const now = Date.now();
  if (!TM.first) { TM.first = now; missionStartMs = now; }
  TM.lastRx = now; TM.count++;
  setLink(true);
  const tLabel = ((now - TM.first) / 1000).toFixed(1);

  appendRawLine(rawText ?? JSON.stringify(raw));

  // ---- GPS ----
  const lat = num(raw.lat), lon = num(raw.lon), gpsValid = bool(raw.gps_valid);
  if (lat !== undefined && lon !== undefined && !(lat === 0 && lon === 0) && gpsValid !== false) {
    window._lastFix = { lat, lon };
    if (window._groundMapRefresh) window._groundMapRefresh(lat, lon);
    if (window._csMapRefresh)     window._csMapRefresh(lat, lon);
  }

  // ---- RSSI / range ----
  const rssi = num(raw.rssi);
  if (rssi !== undefined) { setText('rssiVal', Math.round(rssi)); buildBars(rssi); }
  const rangeKm = num(raw.range_km);
  if (rangeKm !== undefined) setText('rangeVal', '~' + rangeKm.toFixed(1) + ' km');

  // ---- Altitude + speed ----
  const alt = num(raw.alt), altRaw = num(raw.alt_raw), speed = num(raw.speed);
  if (alt    !== undefined) pushPoint(altKChart, tLabel, alt);
  if (altRaw !== undefined) pushPoint(altRChart, tLabel, altRaw);
  if (speed !== undefined)      window.setRocketSpeed(speed);
  else if (alt !== undefined)   window.updateRocketSpeed(alt, now);

  // ---- Attitude ----
  const roll = num(raw.roll), pitch = num(raw.pitch), yaw = num(raw.yaw);
  if (roll  !== undefined) setText('rollVal',  roll.toFixed(1));
  if (pitch !== undefined) setText('pitchVal', pitch.toFixed(1));
  if (yaw   !== undefined) setText('yawVal',   yaw.toFixed(1));
  if (roll !== undefined && pitch !== undefined && yaw !== undefined) {
    const tilt = Math.hypot(roll, pitch);
    setText('gyroRollDisp',  roll.toFixed(1));
    setText('gyroPitchDisp', pitch.toFixed(1));
    setText('gyroYawDisp',   yaw.toFixed(1));
    setText('gyroTiltVal',   tilt.toFixed(1));
    setText('gyroSpinVal',   Math.abs(yaw).toFixed(1));
    setWidth('gyroTiltBar',  Math.min(100, (tilt / 90) * 100) + '%');
    setWidth('gyroSpinBar',  Math.min(100, (Math.abs(yaw) / 180) * 100) + '%');
    setWidth('gyroRollBar2', Math.min(100, (Math.abs(roll) / 180) * 100) + '%');
    if (window._rocketSetAttitude) window._rocketSetAttitude(roll, pitch, yaw);
  }

  // ---- Gyro raw (°/s) ----
  const gx = num(raw.gx), gy = num(raw.gy), gz = num(raw.gz);
  if (gx !== undefined) setText('gyroGxDisp', gx.toFixed(2));
  if (gy !== undefined) setText('gyroGyDisp', gy.toFixed(2));
  if (gz !== undefined) setText('gyroGzDisp', gz.toFixed(2));
  if (gx !== undefined || gy !== undefined || gz !== undefined || roll !== undefined) setText('gyroStatus', 'ONLINE');

  // ---- Accelerometer ----
  const ax = num(raw.ax), ay = num(raw.ay), az = num(raw.az);
  if (ax !== undefined && ay !== undefined && az !== undefined) {
    const mag = Math.hypot(ax, ay, az);
    window._csAccelMagTarget = mag;
    setText('csAccelMag', mag.toFixed(2));
    setText('accelStatus', 'ONLINE');
  }
  if (num(raw.mx) !== undefined || num(raw.my) !== undefined || num(raw.mz) !== undefined) setText('magStatus', 'ONLINE');

  // ---- Power (ampere = mA) ----
  const amp = num(raw.ampere), volt = num(raw.voltage);
  let ohm = num(raw.ohm);
  if (amp  !== undefined) setText('csAmpVal',  amp.toFixed(0));
  if (volt !== undefined) setText('csVoltVal', volt.toFixed(2));
  if (ohm === undefined && amp !== undefined && volt !== undefined && amp > 0) ohm = volt / (amp / 1000);
  if (ohm  !== undefined) setText('csOhmVal',  ohm.toFixed(2));

  // ---- IMU status extras ----
  const temp = num(raw.temp ?? raw.imu_temp), hz = num(raw.fusion_hz);
  if (temp !== undefined) setText('imuTemp',  temp.toFixed(1) + '°C');
  if (hz   !== undefined) setText('fusionHz', Math.round(hz) + ' Hz');

  // ---- Backup status ----
  const backup = bool(raw.backup), bk = $el('backupStatus');
  if (backup !== undefined && bk) {
    bk.textContent       = backup ? '✅ BACKUP OK' : '⚠ BACKUP FAIL';
    bk.style.color       = backup ? '#00ff88' : '#ff4e6a';
    bk.style.borderColor = backup ? '#00ff8860' : '#ff4e6a60';
    bk.style.background  = backup ? 'rgba(0,255,136,0.08)' : 'rgba(255,78,106,0.08)';
  }

  // ---- Data loss: ใช้ field "loss" ถ้ามี ไม่งั้นคำนวณจาก "seq" ----
  let loss = num(raw.loss);
  const seq = num(raw.seq);
  if (seq !== undefined) {
    if (TM.seqLast !== null && seq < TM.seqLast) { TM.seqFirst = seq; TM.seqRecv = 0; }   // ESP รีบูต
    if (TM.seqFirst === null) TM.seqFirst = seq;
    if (seq !== TM.seqLast) TM.seqRecv++;                                                // ข้ามแพ็กเกจซ้ำ
    TM.seqLast = seq;
    if (loss === undefined) {
      const expected = seq - TM.seqFirst + 1;
      loss = expected > 0 ? Math.max(0, (expected - TM.seqRecv) / expected * 100) : 0;
    }
  }
  if (loss !== undefined && dataLossLinearChart) {
    lossPoints.push({ x: parseFloat(tLabel), y: loss });
    if (lossPoints.length > TELEMETRY_CONFIG.maxLossPoints) lossPoints.shift();
    dataLossLinearChart.data.datasets[0].data = lossPoints;
    dataLossLinearChart.data.datasets[1].data = getRegressionLine(lossPoints);
    dataLossLinearChart.update('none');
    resizeLossChart();
    setText('lossVal', loss.toFixed(1) + '%');
  }
}
