// js/cansat/gps-map.js — CanSat GPS map + trail

// ---- 4. CanSat GPS Map (Leaflet) ----
function initCsMap() {
  const baseLat = 13.5751993;
  const baseLng = 100.5714753;

  // Init Leaflet map
  const csMap = L.map('csLeafletMap', {
    center: [baseLat, baseLng],
    zoom: 17,
    zoomControl: true,
    attributionControl: false
  });

  // OpenStreetMap tile — ดูคล้าย Google Maps
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(csMap);

  // Yellow marker icon for CanSat
  const yellowIcon = L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:#f5d800;
      box-shadow:0 0 12px #f5d800, 0 0 24px rgba(245,216,0,0.6);
      border:2px solid rgba(245,216,0,0.8);
      position:relative;">
      <div style="
        position:absolute;inset:-8px;border-radius:50%;
        border:1.5px solid rgba(245,216,0,0.5);
        animation:pingAnim 1.8s ease-out infinite;">
      </div>
    </div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  const csMarker = L.marker([baseLat, baseLng], { icon: yellowIcon });  // เพิ่มลงแผนที่เมื่อได้ GPS fix จริง
  let csHasFix = false;

  // Track trail path
  const trailCoords = [];
  const trailLine = L.polyline(trailCoords, {
    color: 'rgba(245,216,0,0.5)',
    weight: 2,
    dashArray: '4 4'
  }).addTo(csMap);

  // Expose refresh function for Firebase listener
  window._csMapRefresh = function(lat, lng) {
    csMarker.setLatLng([lat, lng]);
    if (!csHasFix) { csHasFix = true; csMarker.addTo(csMap); csMap.setView([lat, lng], 17); }
    else csMap.panTo([lat, lng]);
    trailCoords.push([lat, lng]);
    if (trailCoords.length > 200) trailCoords.shift();
    trailLine.setLatLngs(trailCoords);

    const e = id => document.getElementById(id);
    if(e('csLatVal'))     e('csLatVal').textContent     = lat.toFixed(6);
    if(e('csLonVal'))     e('csLonVal').textContent     = lng.toFixed(6);
    if(e('csLatOverlay')) e('csLatOverlay').textContent = lat.toFixed(6);
    if(e('csLonOverlay')) e('csLonOverlay').textContent = lng.toFixed(6);
  };
  if (window._lastFix) window._csMapRefresh(window._lastFix.lat, window._lastFix.lon);
}
