import React, { useEffect, useState } from "react";
import {
  MapContainer, TileLayer, CircleMarker, Popup,
  Polyline, Circle, Marker, useMap, useMapEvents
} from "react-leaflet";
import axios from "axios";
import Home from "./HomePage";

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --rose:       #f43f5e;
    --rose-light: #fb7185;
    --rose-dim:   rgba(244,63,94,0.14);
    --violet:     #7c3aed;
    --violet-dim: rgba(124,58,237,0.14);
    --green:      #10b981;
    --green-dim:  rgba(16,185,129,0.12);
    --amber:      #f59e0b;
    --blue:       #3b82f6;

    --bg-deep:    #0a0812;
    --bg-card:    rgba(14,10,24,0.96);
    --bg-glass:   rgba(255,255,255,0.04);
    --border:     rgba(255,255,255,0.08);
    --border-r:   rgba(244,63,94,0.25);

    --text:       #f5f0ff;
    --muted:      #8b7fa8;
    --dim:        #4d4468;

    --ff-display: 'Playfair Display', Georgia, serif;
    --ff-body:    'DM Sans', sans-serif;
    --ff-mono:    'JetBrains Mono', monospace;
  }

  /* ── Side Panel ── */
  .sv-panel {
    position: absolute;
    top: 70px; right: 16px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 240px;
    font-family: var(--ff-body);
  }

  /* ── Action Buttons ── */
  .sv-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 13px 16px;
    border-radius: 14px;
    cursor: pointer;
    background: var(--bg-card);
    border: 1px solid var(--border-r);
    color: var(--text);
    font-family: var(--ff-body);
    font-size: 13.5px; font-weight: 600;
    letter-spacing: 0.2px;
    backdrop-filter: blur(16px);
    width: 100%; text-align: left;
    transition: all 0.2s ease;
    position: relative; overflow: hidden;
  }
  .sv-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, var(--rose-dim) 0%, transparent 60%);
    opacity: 0; transition: opacity 0.2s;
  }
  .sv-btn:hover::before  { opacity: 1; }
  .sv-btn:hover          { border-color: rgba(244,63,94,0.55); transform: translateX(-2px); box-shadow: 0 4px 20px rgba(244,63,94,0.15); }
  .sv-btn:active         { transform: scale(0.98); }
  .sv-btn .sv-icon       { font-size: 17px; flex-shrink: 0; }
  .sv-btn .sv-label      { flex: 1; }
  .sv-btn .sv-arrow      { color: var(--muted); font-size: 11px; transition: transform 0.2s; }
  .sv-btn:hover .sv-arrow { transform: translateX(2px); color: var(--rose-light); }

  .sv-btn.emergency {
    background: linear-gradient(135deg, rgba(244,63,94,0.15) 0%, rgba(124,58,237,0.08) 100%);
    border-color: rgba(244,63,94,0.4);
  }
  .sv-btn.emergency:hover {
    border-color: var(--rose);
    box-shadow: 0 4px 24px rgba(244,63,94,0.3), 0 0 0 1px rgba(244,63,94,0.2);
  }
  .sv-btn.emergency::after {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 14px;
    background: transparent;
    border: 1px solid transparent;
    animation: emergencyPulse 2.5s ease-in-out infinite;
  }
  @keyframes emergencyPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(244,63,94,0); }
    50%      { box-shadow: 0 0 0 6px rgba(244,63,94,0.12); }
  }

  /* ── Police Panel ── */
  .police-panel {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    backdrop-filter: blur(20px);
    overflow: hidden;
    animation: panelSlide .22s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 16px 48px rgba(0,0,0,0.5);
  }
  @keyframes panelSlide {
    from { opacity:0; transform:translateY(-12px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  .pp-header {
    padding: 12px 16px 10px;
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid var(--border);
    background: rgba(244,63,94,0.05);
  }
  .pp-title {
    font-size: 11px; font-weight: 700;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--rose-light);
    font-family: var(--ff-body);
  }
  .pp-subtitle {
    font-size: 10px; color: var(--muted);
    font-family: var(--ff-body);
    margin-top: 1px;
  }
  .pp-close {
    cursor: pointer; color: var(--muted);
    font-size: 13px; line-height: 1;
    width: 24px; height: 24px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 50%;
    background: var(--bg-glass);
    border: 1px solid var(--border);
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .pp-close:hover { color: var(--text); background: rgba(244,63,94,0.15); border-color: var(--border-r); }

  /* ── Police Items ── */
  .police-item {
    display: flex; flex-direction: column;
    padding: 11px 14px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    cursor: pointer;
    transition: background .15s;
    gap: 7px;
  }
  .police-item:last-child { border-bottom: none; }
  .police-item:hover { background: rgba(255,255,255,0.03); }
  .police-item.active {
    background: rgba(59,130,246,0.07);
    border-left: 2px solid var(--blue);
    padding-left: 12px;
  }

  .pi-top { display:flex; align-items:center; gap:8px; }
  .pi-name {
    font-size: 13px; font-weight: 600; color: var(--text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    flex: 1; font-family: var(--ff-body);
  }
  .pi-bottom { display:flex; align-items:center; justify-content:space-between; }
  .pi-dist {
    font-size: 11.5px; color: var(--blue);
    font-family: var(--ff-mono); font-weight: 500;
    display: flex; align-items: center; gap: 4px;
  }
  .pi-btns { display:flex; gap:5px; }

  /* ── Pills ── */
  .pill {
    font-size: 10px; font-weight: 700; letter-spacing: 0.3px;
    padding: 4px 10px; border-radius: 99px; border: none;
    cursor: pointer; font-family: var(--ff-body);
    transition: all 0.15s; white-space: nowrap;
  }
  .pill:hover  { opacity: 0.85; transform: scale(1.04); }
  .pill:active { transform: scale(0.96); }
  .pill-safe  {
    background: rgba(59,130,246,0.14); color: #93c5fd;
    border: 1px solid rgba(59,130,246,0.3);
  }
  .pill-safe:hover { background: rgba(59,130,246,0.24); }
  .pill-short {
    background: rgba(16,185,129,0.12); color: #6ee7b7;
    border: 1px solid rgba(16,185,129,0.28);
  }
  .pill-short:hover { background: rgba(16,185,129,0.22); }

  /* ── Rank Badge ── */
  .rank {
    display: inline-flex; align-items: center; justify-content: center;
    width: 19px; height: 19px; border-radius: 50%; flex-shrink: 0;
    background: rgba(59,130,246,0.12); color: #93c5fd;
    font-size: 9px; font-weight: 700;
    border: 1px solid rgba(59,130,246,0.25);
    font-family: var(--ff-mono);
  }
  .rank.gold {
    background: rgba(245,158,11,0.14); color: #fcd34d;
    border-color: rgba(245,158,11,0.32);
  }

  /* ── Route Banner ── */
  .route-banner {
    position: absolute; bottom: 36px; left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: var(--bg-card);
    color: var(--text);
    padding: 11px 28px;
    border-radius: 99px;
    font-size: 13px;
    font-family: var(--ff-body); font-weight: 500;
    letter-spacing: 0.2px;
    pointer-events: none;
    max-width: 88vw; text-align: center;
    border: 1px solid var(--border-r);
    backdrop-filter: blur(16px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(244,63,94,0.08);
    white-space: nowrap;
    animation: bannerUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes bannerUp {
    from { opacity:0; transform:translateX(-50%) translateY(10px); }
    to   { opacity:1; transform:translateX(-50%) translateY(0); }
  }

  /* ── Spinner ── */
  .spinner {
    display: inline-block; width: 11px; height: 11px;
    border: 2px solid rgba(244,63,94,0.25); border-top-color: var(--rose-light);
    border-radius: 50%; animation: spin .7s linear infinite;
    margin-right: 8px; vertical-align: middle;
  }
  @keyframes spin { to { transform:rotate(360deg); } }

  /* ── Empty State ── */
  .pp-empty {
    padding: 16px 14px; color: var(--muted);
    font-size: 12.5px; font-family: var(--ff-body);
    text-align: center; display: flex; align-items: center;
    justify-content: center; gap: 8px;
  }

  /* ── Legend ── */
  .map-legend {
    position: absolute; bottom: 36px; left: 16px;
    z-index: 1000;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 10px 14px;
    backdrop-filter: blur(16px);
    font-family: var(--ff-body);
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    animation: fadeIn 0.3s ease;
  }
  @keyframes fadeIn {
    from { opacity:0; transform:translateY(6px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .legend-title {
    font-size: 9px; font-weight: 700; letter-spacing: 1.4px;
    text-transform: uppercase; color: var(--muted);
    margin-bottom: 8px;
  }
  .legend-item {
    display: flex; align-items: center; gap: 8px;
    font-size: 11.5px; color: var(--text);
    margin-bottom: 5px;
  }
  .legend-item:last-child { margin-bottom: 0; }
  .legend-dot {
    width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
  }
  .legend-line {
    width: 18px; height: 3px; border-radius: 2px; flex-shrink: 0;
  }
`;

if (!document.getElementById("sv-styles")) {
  const s = document.createElement("style");
  s.id = "sv-styles"; s.textContent = STYLES;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
const getDistance = (a, b, c, d) => {
  const R=6371000, r=x=>x*Math.PI/180, dl=r(c-a), dg=r(d-b);
  return R*2*Math.atan2(Math.sqrt(Math.sin(dl/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(dg/2)**2),
                        Math.sqrt(1-(Math.sin(dl/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(dg/2)**2)));
};
const getColor  = r => ({ high:"#f43f5e", medium:"#f59e0b" }[r?.toLowerCase()] ?? "#10b981");
const getRadius = r => ({ high:1000, medium:500 }[r?.toLowerCase()] ?? 200);
const checkSafe = (coords, hs) =>
  coords.some(p => hs.some(z => getDistance(p[0],p[1],z.lat,z.lng) <= getRadius(z.risk)));
const fmtDist = m => m >= 1000 ? `${(m/1000).toFixed(1)} km` : `${Math.round(m)} m`;

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════ */
const UserLocation = ({ position }) => {
  const map = useMap();
  useEffect(() => { if (position) map.setView(position, 14); }, [position]);
  if (!position) return null;
  return (
    <CircleMarker center={position} radius={8}
      pathOptions={{ color:"rgba(244,63,94,0.6)", fillColor:"#f43f5e", fillOpacity:1, weight:2.5 }}>
      <Popup><b>📍 You are here</b></Popup>
    </CircleMarker>
  );
};

const MapClickHandler = ({ setDestination, fetchRoute }) => {
  useMapEvents({
    click(e) {
      const c = [e.latlng.lat, e.latlng.lng];
      setDestination(c); fetchRoute(c);
    }
  });
  return null;
};

/* ═══════════════════════════════════════════
   MAPVIEW
═══════════════════════════════════════════ */
const MapView = () => {
  const [userPos,       setUserPos]       = useState(null);
  const [route,         setRoute]         = useState([]);
  const [safeRoute,     setSafeRoute]     = useState([]);
  const [hotspots,      setHotspots]      = useState([]);
  const [destination,   setDestination]   = useState(null);
  const [isUnsafe,      setIsUnsafe]      = useState(false);
  const [status,        setStatus]        = useState("");
  const [loading,       setLoading]       = useState(false);
  const [policeList,    setPoliceList]    = useState([]);
  const [policeLoading, setPoliceLoading] = useState(false);
  const [showPanel,     setShowPanel]     = useState(false);
  const [activeIdx,     setActiveIdx]     = useState(null);

  useEffect(() => {
    const id = navigator.geolocation.watchPosition(p =>
      setUserPos([p.coords.latitude, p.coords.longitude]));
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  useEffect(() => {
    const load = () =>
      axios.get("https://womensafety-be36.onrender.com/api/hotspots")
        .then(r => setHotspots(r.data)).catch(console.error);
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  /* ── Generic route ── */
  const fetchRoute = async (dest) => {
    if (!userPos) return alert("Waiting for your location…");
    setLoading(true); setStatus("Finding route…");
    setRoute([]); setSafeRoute([]); setIsUnsafe(false);
    try {
      const { data } = await axios.post("https://womensafety-be36.onrender.com/api/route",
        { start: userPos, end: dest });
      const direct = data.route.coordinates.map(c => [c[1],c[0]]);
      if (!checkSafe(direct, hotspots)) {
        setRoute(direct); setStatus("✅ Route is safe to travel");
        setLoading(false); return;
      }
      setIsUnsafe(true); setRoute(direct);
      setStatus("⚠️ Unsafe zone detected — finding safe detour…");
      const { data: sd } = await axios.post("https://womensafety-be36.onrender.com/api/safe-route",
        { start: userPos, end: dest, hotspots });
      const safe = sd.route.coordinates.map(c => [c[1],c[0]]);
      setSafeRoute(safe);
      setStatus(checkSafe(safe, hotspots)
        ? "⚠️ Detour partially avoids danger — proceed with caution"
        : "🟢 Safe detour found — follow the green path");
    } catch (e) {
      console.error(e); setStatus("❌ Could not calculate route.");
    } finally { setLoading(false); }
  };

  /* ── Shortest to police ── */
  const fetchShortestToPolice = async (stn, idx) => {
    if (!userPos) return;
    setActiveIdx(idx); setDestination([stn.lat, stn.lng]);
    setLoading(true); setStatus(`📍 Shortest route to ${stn.name}…`);
    setRoute([]); setSafeRoute([]); setIsUnsafe(false);
    try {
      const { data } = await axios.post("https://womensafety-be36.onrender.com/api/route",
        { start: userPos, end: [stn.lat, stn.lng] });
      const coords = data.route.coordinates.map(c => [c[1],c[0]]);
      setRoute(coords);
      setStatus(`🚓 Shortest to ${stn.name} — ${fmtDist(stn.distance_m)}`);
    } catch (e) {
      console.error(e); setStatus("❌ Route failed.");
    } finally { setLoading(false); }
  };

  /* ── Safe route to police ── */
  const fetchSafeToPolice = async (stn, idx) => {
    setActiveIdx(idx); setDestination([stn.lat, stn.lng]);
    await fetchRoute([stn.lat, stn.lng]);
  };

  /* ── Load police list ── */
  const loadPolice = async () => {
    if (!userPos) return alert("User location not available");
    setPoliceLoading(true); setShowPanel(true); setPoliceList([]);
    try {
      const { data } = await axios.post("https://womensafety-be36.onrender.com/api/nearest_police_list",
        { lat: userPos[0], lng: userPos[1] });
      setPoliceList(data.stations || []);
    } catch (e) {
      console.error(e); alert("Could not fetch nearby police stations");
      setShowPanel(false);
    } finally { setPoliceLoading(false); }
  };

  /* ── Render ── */
  return (
    <>
      <Home onSearch={c => { setDestination(c); fetchRoute(c); }} />

      {/* Route Status Banner */}
      {status && (
        <div className="route-banner">
          {loading && <span className="spinner" />}
          {status}
        </div>
      )}

      {/* ── Side Panel ── */}
      <div className="sv-panel">

        {/* Nearest Police Button */}
        <button className="sv-btn" onClick={loadPolice}>
          <span className="sv-icon">🚨</span>
          <span className="sv-label">
            {policeLoading ? "Searching stations…" : "Nearest Police"}
          </span>
          <span className="sv-arrow">›</span>
        </button>

        {/* Police Stations List */}
        {showPanel && (
          <div className="police-panel">
            <div className="pp-header">
              <div>
                <div className="pp-title">Nearby Stations</div>
                <div className="pp-subtitle">
                  {policeList.length > 0
                    ? `${policeList.length} found near you`
                    : "Searching…"}
                </div>
              </div>
              <div className="pp-close" onClick={() => setShowPanel(false)}>✕</div>
            </div>

            {policeLoading && (
              <div className="pp-empty">
                <span className="spinner" /> Locating stations…
              </div>
            )}

            {!policeLoading && policeList.length === 0 && (
              <div className="pp-empty">😔 No stations found nearby.</div>
            )}

            {policeList.map((stn, i) => (
              <div
                key={i}
                className={`police-item ${activeIdx === i ? "active" : ""}`}
                onClick={() => fetchSafeToPolice(stn, i)}
              >
                <div className="pi-top">
                  <span className={`rank ${i === 0 ? "gold" : ""}`}>{i + 1}</span>
                  <span className="pi-name" title={stn.name}>{stn.name}</span>
                </div>
                <div className="pi-bottom">
                  <span className="pi-dist">📍 {fmtDist(stn.distance_m)}</span>
                  <div className="pi-btns" onClick={e => e.stopPropagation()}>
                    <button className="pill pill-safe"
                      onClick={() => fetchSafeToPolice(stn, i)}>
                      Safe Route
                    </button>
                    <button className="pill pill-short"
                      onClick={() => fetchShortestToPolice(stn, i)}>
                      Shortest
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Emergency Call Button */}
        <button className="sv-btn emergency" onClick={() => {
          if (!userPos) return alert("User location not available");
          axios.post("https://womensafety-be36.onrender.com/api/send-emergency",
            { lat: userPos[0], lng: userPos[1] }).catch(console.error);
          alert("📞 Calling Police: 100  |  Women Safety: 1091");
          window.open("tel:100"); window.open("tel:1091");
        }}>
          <span className="sv-icon">📞</span>
          <span className="sv-label">Call Emergency</span>
          <span style={{
            fontSize: "9px", fontWeight: "700", letterSpacing: "0.5px",
            background: "rgba(244,63,94,0.2)", color: "#fb7185",
            padding: "2px 7px", borderRadius: "99px",
            border: "1px solid rgba(244,63,94,0.3)",
          }}>SOS</span>
        </button>
      </div>

      {/* ── Map Legend ── */}
      {(hotspots.length > 0 || route.length > 0 || safeRoute.length > 0) && (
        <div className="map-legend">
          <div className="legend-title">Map Legend</div>
          {hotspots.some(h => h.risk?.toLowerCase() === "high") && (
            <div className="legend-item">
              <div className="legend-dot" style={{ background: "#f43f5e" }} />
              High Risk Zone
            </div>
          )}
          {hotspots.some(h => h.risk?.toLowerCase() === "medium") && (
            <div className="legend-item">
              <div className="legend-dot" style={{ background: "#f59e0b" }} />
              Medium Risk Zone
            </div>
          )}
          {hotspots.some(h => !["high","medium"].includes(h.risk?.toLowerCase())) && (
            <div className="legend-item">
              <div className="legend-dot" style={{ background: "#10b981" }} />
              Low Risk Zone
            </div>
          )}
          {route.length > 0 && isUnsafe && (
            <div className="legend-item">
              <div className="legend-line" style={{ background: "#f43f5e" }} />
              Unsafe Route
            </div>
          )}
          {safeRoute.length > 0 && (
            <div className="legend-item">
              <div className="legend-line" style={{ background: "#10b981" }} />
              Safe Detour
            </div>
          )}
          {route.length > 0 && !isUnsafe && (
            <div className="legend-item">
              <div className="legend-line" style={{ background: "#3b82f6" }} />
              Safe Route
            </div>
          )}
          {policeList.length > 0 && (
            <div className="legend-item">
              <div className="legend-dot" style={{ background: "#3b82f6" }} />
              Police Station
            </div>
          )}
        </div>
      )}

      {/* ── Leaflet Map ── */}
      <MapContainer
        center={[18.5204, 73.8567]}
        zoom={7}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <UserLocation position={userPos} />
        <MapClickHandler setDestination={setDestination} fetchRoute={fetchRoute} />

        {destination && (
          <Marker position={destination}>
            <Popup><b>🎯 Destination</b></Popup>
          </Marker>
        )}

        {/* Danger Zones */}
        {hotspots.map((pt, i) => (
          <Circle key={i} center={[pt.lat, pt.lng]} radius={getRadius(pt.risk)}
            pathOptions={{ color: getColor(pt.risk), fillOpacity: 0.18, weight: 1.5 }}>
            <Popup>
              <b>{pt.area}</b> · {pt.city}<br />
              Risk Level: <b style={{ color: getColor(pt.risk) }}>{pt.risk}</b>
            </Popup>
          </Circle>
        ))}
        {hotspots.map((pt, i) => (
          <CircleMarker key={"d" + i} center={[pt.lat, pt.lng]} radius={5}
            pathOptions={{ color: getColor(pt.risk), fillColor: getColor(pt.risk), fillOpacity: 1, weight: 1 }} />
        ))}

        {/* Police Station Markers */}
        {policeList.map((stn, i) => (
          <CircleMarker key={"ps" + i} center={[stn.lat, stn.lng]} radius={9}
            pathOptions={{ color: "rgba(147,197,253,0.8)", fillColor: "#3b82f6", fillOpacity: 0.9, weight: 2 }}
            eventHandlers={{ click: () => fetchSafeToPolice(stn, i) }}>
            <Popup>
              <b>🚔 {stn.name}</b><br />{fmtDist(stn.distance_m)} away
            </Popup>
          </CircleMarker>
        ))}

        {/* Route: Unsafe (red dashed) */}
        {route.length > 0 && isUnsafe && (
          <Polyline positions={route}
            pathOptions={{ color: "#f43f5e", dashArray: "10 7", weight: 4.5, opacity: 0.75 }} />
        )}

        {/* Route: Safe Detour (green) */}
        {safeRoute.length > 0 && (
          <Polyline positions={safeRoute}
            pathOptions={{ color: "#10b981", weight: 5.5, opacity: 0.9 }} />
        )}

        {/* Route: Safe Direct (blue) */}
        {route.length > 0 && !isUnsafe && (
          <Polyline positions={route}
            pathOptions={{ color: "#3b82f6", weight: 5.5, opacity: 0.9 }} />
        )}
      </MapContainer>
    </>
  );
};

export default MapView;