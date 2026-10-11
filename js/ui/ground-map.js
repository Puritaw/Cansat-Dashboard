// js/ui/ground-map.js — Ground-station Leaflet map

// ===== GROUND STATION — LEAFLET MAP =====
(function initGroundMap() {
  const BASE_LAT = 13.5751993;
  const BASE_LNG = 100.5714753;

  // Init Leaflet map
  const groundMap = L.map('groundLeafletMap', {
    center: [BASE_LAT, BASE_LNG],
    zoom: 17,
    zoomControl: true,
    attributionControl: false
  });

  // OpenStreetMap tile — ดูคล้าย Google Maps
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(groundMap);

  // Custom green marker icon
  const greenIcon = L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:#98FB98;
      box-shadow:0 0 12px #98FB98, 0 0 24px rgba(152,251,152,0.6);
      border:2px solid rgba(152,251,152,0.8);
      position:relative;">
      <div style="
        position:absolute;inset:-8px;border-radius:50%;
        border:1.5px solid rgba(152,251,152,0.5);
        animation:pingAnim 1.8s ease-out infinite;">
      </div>
    </div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  const groundMarker = L.marker([BASE_LAT, BASE_LNG], { icon: greenIcon });  // เพิ่มลงแผนที่เมื่อได้ GPS fix จริง
  let groundHasFix = false;

  function refreshMap(lat, lng) {
    const latEl  = document.getElementById('latVal');
    const lonEl  = document.getElementById('lonVal');
    const titleEl = document.getElementById('mapCoordTitle');
    if (latEl)   latEl.textContent  = lat.toFixed(6);
    if (lonEl)   lonEl.textContent  = lng.toFixed(6);
    if (titleEl) titleEl.textContent = lat.toFixed(4) + ', ' + lng.toFixed(4);

    groundMarker.setLatLng([lat, lng]);
    if (!groundHasFix) { groundHasFix = true; groundMarker.addTo(groundMap); groundMap.setView([lat, lng], 17); }
    else groundMap.panTo([lat, lng]);
  }

  window._groundMapRefresh = refreshMap;
})();
