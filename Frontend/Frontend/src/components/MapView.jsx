import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  Circle,
  Marker,
  useMap,
  useMapEvents
} from "react-leaflet";
import axios from "axios";
import Home from "./HomePage";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/* ─── inject styles once ─── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  :root {
    --red:    #ff3b3b;
    --green:  #00e676;
    --blue:   #2979ff;
    --pink:   #ff4f9a;
    --amber:  #ffb020;
    --bg:     rgba(10,12,22,0.93);
    --border: rgba(255,255,255,0.09);
    --text:   #eef0ff;
    --muted:  #7a80a0;
  }
  .map-ui-light {
    --ui-bg: rgba(255,255,255,.94);
    --ui-border: rgba(148,163,184,.28);
    --ui-text: #0f172a;
    --ui-muted: #64748b;
    --ui-hover: rgba(37,99,235,.08);
    --ui-shadow: 0 18px 40px rgba(148,163,184,.24);
    --ui-icon-bg: rgba(255,255,255,.72);
    --ui-icon-shadow: inset 0 1px 0 rgba(255,255,255,.74), 0 8px 20px rgba(148,163,184,.24);
    --ui-subtext: rgba(15,23,42,.55);
  }
  .map-ui-dark {
    --ui-bg: rgba(10,12,22,.93);
    --ui-border: rgba(255,255,255,.09);
    --ui-text: #eef0ff;
    --ui-muted: #7a80a0;
    --ui-hover: rgba(255,255,255,.04);
    --ui-shadow: 0 18px 40px rgba(10,12,22,.38);
    --ui-icon-bg: rgba(255,255,255,.14);
    --ui-icon-shadow: inset 0 1px 0 rgba(255,255,255,.18);
    --ui-subtext: rgba(255,255,255,.68);
  }
  .sos-panel {
    position: absolute; right: 18px; bottom: 20px; z-index: 1000;
    display: flex; flex-direction: column; gap: 12px; width: min(320px, calc(100vw - 32px));
    align-items: stretch;
    font-family: 'Rajdhani', sans-serif;
  }
  .sos-actions {
    display: grid; grid-template-columns: 1fr; gap: 12px;
  }
  .sos-btn {
    position: relative; overflow: hidden;
    display: flex; align-items: center; gap: 12px;
    justify-content: flex-start; padding: 14px 16px; border-radius: 18px; cursor: pointer;
    background: linear-gradient(135deg, rgba(15,23,42,.96), rgba(20,28,48,.88)); border: 1px solid var(--border);
    color: var(--ui-text); font-family: 'Rajdhani', sans-serif;
    font-size: 16px; font-weight: 700; letter-spacing: 0.4px;
    backdrop-filter: blur(12px); width: 100%; text-align: left;
    box-shadow: var(--ui-shadow);
    transition: border-color .18s, transform .12s, box-shadow .18s, filter .18s;
  }
  .sos-btn::before {
    content: ""; position: absolute; inset: 0;
    background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,.18) 18%, transparent 36%);
    transform: translateX(-130%); transition: transform .45s ease;
  }
  .sos-btn:hover::before { transform: translateX(130%); }
  .sos-btn:hover  { transform: translateY(-2px) scale(1.01); }
  .sos-btn:active { transform: scale(0.97); }
  .sos-btn.police {
    border-color: rgba(41,121,255,.48);
    background: linear-gradient(135deg, rgba(16,34,68,.98), rgba(25,96,180,.82));
    box-shadow: 0 18px 36px rgba(19,74,150,.34);
  }
  .sos-btn.police:hover {
    border-color: rgba(122,173,255,.9);
    box-shadow: 0 20px 40px rgba(41,121,255,.38);
    filter: saturate(1.12);
  }
  .sos-btn.emergency {
    border-color: rgba(255,79,154,.42);
    background: linear-gradient(135deg, rgba(73,16,38,.98), rgba(205,52,104,.86));
    box-shadow: 0 18px 36px rgba(165,34,76,.34);
  }
  .sos-btn.emergency:hover {
    border-color: rgba(255,183,208,.92);
    box-shadow: 0 20px 40px rgba(255,79,154,.34);
    filter: saturate(1.12);
  }
  .sos-btn-icon {
    position: relative; z-index: 1;
    display: inline-flex; align-items: center; justify-content: center;
    width: 34px; height: 34px; border-radius: 12px;
    background: var(--ui-icon-bg);
    box-shadow: var(--ui-icon-shadow);
    font-size: 16px;
  }
  .sos-btn-copy {
    position: relative; z-index: 1;
    display: flex; flex-direction: column; line-height: 1;
  }
  .sos-btn-title {
    font-size: 17px; font-weight: 700; letter-spacing: .35px;
  }
  .sos-btn-sub {
    margin-top: 4px; font-size: 11px; font-weight: 600;
    letter-spacing: .12em; text-transform: uppercase; color: var(--ui-subtext);
  }
  .map-ui-light .sos-btn.police {
    border-color: rgba(59,130,246,.24);
    background: linear-gradient(135deg, rgba(239,246,255,.98), rgba(147,197,253,.92));
    color: #0f172a;
    box-shadow: 0 18px 36px rgba(59,130,246,.18);
  }
  .map-ui-light .sos-btn.emergency {
    border-color: rgba(244,114,182,.22);
    background: linear-gradient(135deg, rgba(255,241,242,.98), rgba(251,207,232,.96));
    color: #4c0519;
    box-shadow: 0 18px 36px rgba(244,114,182,.18);
  }
  .map-ui-light .sos-btn-sub {
    color: rgba(15,23,42,.55);
  }

  .police-panel {
    background: var(--ui-bg); border: 1px solid var(--ui-border);
    border-radius: 12px; backdrop-filter: blur(14px);
    overflow: hidden; animation: slideDown .2s ease;
    box-shadow: var(--ui-shadow);
    max-height: min(45vh, 360px);
    overflow-y: auto;
  }
  @keyframes slideDown {
    from { opacity:0; transform:translateY(-8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .pp-header {
    padding: 9px 14px 7px; font-size: 10px; font-weight: 700;
    letter-spacing: 1.3px; color: var(--ui-muted); text-transform: uppercase;
    border-bottom: 1px solid var(--ui-border);
    display: flex; justify-content: space-between; align-items: center;
  }
  .pp-close { cursor:pointer; color:var(--ui-muted); font-size:14px; line-height:1; }
  .pp-close:hover { color: var(--ui-text); }

  .police-item {
    display: flex; flex-direction: column; padding: 9px 13px;
    border-bottom: 1px solid var(--ui-border); cursor: pointer;
    transition: background .15s; gap: 5px;
  }
  .police-item:last-child { border-bottom: none; }
  .police-item:hover  { background: var(--ui-hover); }
  .police-item.active { background: rgba(41,121,255,0.1); border-left: 3px solid var(--blue); padding-left: 10px; }

  .pi-top { display:flex; align-items:center; gap:7px; }
  .pi-name {
    font-size: 13px; font-weight: 600; color: var(--ui-text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex:1;
  }
  .pi-bot { display:flex; align-items:center; justify-content:space-between; }
  .pi-dist { font-size:12px; color:var(--blue); font-family:'JetBrains Mono',monospace; font-weight:500; }
  .pi-btns { display:flex; gap:5px; }

  .pill {
    font-size: 10px; font-weight: 700; letter-spacing: .4px;
    padding: 3px 9px; border-radius: 20px; border: none;
    cursor: pointer; font-family: 'Rajdhani', sans-serif;
    transition: opacity .15s, transform .1s;
  }
  .pill:hover  { opacity:.82; transform:scale(1.04); }
  .pill:active { transform:scale(0.96); }
  .pill-safe  { background:rgba(41,121,255,.18); color:#7aadff; border:1px solid rgba(41,121,255,.35); }
  .pill-short { background:rgba(0,230,118,.14); color:#00e676; border:1px solid rgba(0,230,118,.32); }

  .rank {
    display:inline-flex; align-items:center; justify-content:center;
    width:17px; height:17px; border-radius:50%; flex-shrink:0;
    background:rgba(41,121,255,.16); color:#7aadff;
    font-size:9px; font-weight:700; border:1px solid rgba(41,121,255,.3);
  }
  .rank.gold { background:rgba(255,200,0,.14); color:#ffd740; border-color:rgba(255,200,0,.35); }

  .route-banner {
    position:absolute; bottom:30px; left:50%; transform:translateX(-50%);
    z-index:1000; background:var(--ui-bg); color:var(--ui-text);
    padding:10px 24px; border-radius:24px;
    font-size:13px; font-family:'Rajdhani',sans-serif; font-weight:600;
    letter-spacing:.3px; pointer-events:none; max-width:84vw; text-align:center;
    border:1px solid var(--ui-border); backdrop-filter:blur(12px);
    box-shadow:var(--ui-shadow); white-space:nowrap;
  }
  .spinner {
    display:inline-block; width:11px; height:11px;
    border:2px solid rgba(255,255,255,.2); border-top-color:#fff;
    border-radius:50%; animation:spin .7s linear infinite;
    margin-right:7px; vertical-align:middle;
  }
  @keyframes spin { to { transform:rotate(360deg); } }
  .pp-empty { padding:12px 14px; color:var(--ui-muted); font-size:12px; }
  @media (max-width: 640px) {
    .sos-panel {
      left: 12px; right: 12px; bottom: 16px; width: auto;
    }
    .route-banner {
      bottom: 164px; max-width: calc(100vw - 24px); white-space: normal;
    }
  }
`;

if (!document.getElementById("mv-styles")) {
  const s = document.createElement("style");
  s.id = "mv-styles"; s.textContent = STYLES;
  document.head.appendChild(s);
}

/* ─── helpers ─── */
const getDistance = (a, b, c, d) => {
  const R = 6371000, r = x => x * Math.PI / 180, dl = r(c - a), dg = r(d - b);
  return R * 2 * Math.atan2(Math.sqrt(Math.sin(dl / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dg / 2) ** 2),
    Math.sqrt(1 - (Math.sin(dl / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dg / 2) ** 2)));
};
const getColor = r => ({ high: "red", medium: "orange" }[r?.toLowerCase()] ?? "green");
const getRadius = r => ({ high: 1000, medium: 500 }[r?.toLowerCase()] ?? 200);
const checkSafe = (coords, hs) =>
  coords.some(p => hs.some(z => getDistance(p[0], p[1], z.lat, z.lng) <= getRadius(z.risk)));
const fmtDist = m => m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;

/* ─── sub-components ─── */
const UserLocation = ({ position }) => {
  const map = useMap();
  useEffect(() => { if (position) map.setView(position, 14); }, [position]);
  if (!position) return null;
  return (
    <CircleMarker center={position} radius={7}
      pathOptions={{ color: "white", fillColor: "#2979ff", fillOpacity: 1, weight: 2 }}>
      <Popup>You are here</Popup>
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

/* ══════════════════════════════════════
   MapView
══════════════════════════════════════ */
const MapView = ({ isDarkMode = false, onToggleTheme }) => {
  const [userPos, setUserPos] = useState(null);
  const [route, setRoute] = useState([]);
  const [safeRoute, setSafeRoute] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [destination, setDestination] = useState(null);
  const [isUnsafe, setIsUnsafe] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [policeList, setPoliceList] = useState([]);
  const [policeLoading, setPoliceLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [activeIdx, setActiveIdx] = useState(null);

  useEffect(() => {
    const id = navigator.geolocation.watchPosition(p =>
      setUserPos([p.coords.latitude, p.coords.longitude]));
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  useEffect(() => {
    const load = () =>
      axios.get("http://localhost:5000/api/hotspots")
        .then(r => setHotspots(r.data)).catch(console.error);
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  /* ── generic route (safe-aware) ── */
  const fetchRoute = async (dest) => {
    if (!userPos) return alert("Waiting for your location…");
    setLoading(true); setStatus("Finding route…");
    setRoute([]); setSafeRoute([]); setIsUnsafe(false);
    try {
      const { data } = await axios.post("http://localhost:5000/api/route",
        { start: userPos, end: dest });
      const direct = data.route.coordinates.map(c => [c[1], c[0]]);
      if (!checkSafe(direct, hotspots)) {
        setRoute(direct); setStatus("✅ Route is safe");
        setLoading(false); return;
      }
      setIsUnsafe(true); setRoute(direct);
      setStatus("⚠️ Unsafe! Calculating safe detour…");
      const { data: sd } = await axios.post("http://localhost:5000/api/safe-route",
        { start: userPos, end: dest, hotspots });
      const safe = sd.route.coordinates.map(c => [c[1], c[0]]);
      setSafeRoute(safe);
      setStatus(checkSafe(safe, hotspots)
        ? "⚠️ Detour partially avoids danger — proceed with caution"
        : "🟢 Safe detour found — follow the green path");
    } catch (e) {
      console.error(e); setStatus("❌ Could not calculate route.");
    } finally { setLoading(false); }
  };

  /* ── shortest (direct OSRM, no avoidance) ── */
  const fetchShortestToPolice = async (stn, idx) => {
    if (!userPos) return;
    setActiveIdx(idx);
    setDestination([stn.lat, stn.lng]);
    setLoading(true); setStatus(`📍 Shortest route to ${stn.name}…`);
    setRoute([]); setSafeRoute([]); setIsUnsafe(false);
    try {
      const { data } = await axios.post("http://localhost:5000/api/route",
        { start: userPos, end: [stn.lat, stn.lng] });
      const coords = data.route.coordinates.map(c => [c[1], c[0]]);
      setRoute(coords);
      setStatus(`🚓 Shortest to ${stn.name} — ${fmtDist(stn.distance_m)}`);
    } catch (e) {
      console.error(e); setStatus("❌ Route failed.");
    } finally { setLoading(false); }
  };

  /* ── safe route to police ── */
  const fetchSafeToPolice = async (stn, idx) => {
    setActiveIdx(idx);
    setDestination([stn.lat, stn.lng]);
    await fetchRoute([stn.lat, stn.lng]);
  };

  /* ── load police list ── */
  const loadPolice = async () => {
    if (!userPos) return alert("User location not available");
    setPoliceLoading(true); setShowPanel(true); setPoliceList([]);
    try {
      const { data } = await axios.post("http://localhost:5000/api/nearest_police_list",
        { lat: userPos[0], lng: userPos[1] });
      setPoliceList(data.stations || []);
    } catch (e) {
      console.error(e); alert("Could not fetch nearby police stations");
      setShowPanel(false);
    } finally { setPoliceLoading(false); }
  };

  /* ── render ── */
  const mapThemeClass = isDarkMode ? "map-ui-dark" : "map-ui-light";
  const tileUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  const tileAttribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO';

  return (
    <>
      <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
      <Home isDarkMode={isDarkMode} onSearch={(c) => {
        setDestination(c);
        fetchRoute(c);
      }} />

      {status && (
        <div className={`route-banner ${mapThemeClass}`}>
          {loading && <span className="spinner" />}{status}
        </div>
      )}

      <div className={`sos-panel ${mapThemeClass}`}>
        {/* Police list panel */}
        {showPanel && (
          <div className="police-panel">
            <div className="pp-header">
              Nearby Stations
              <span className="pp-close" onClick={() => setShowPanel(false)}>✕</span>
            </div>

            {policeLoading && (
              <div className="pp-empty"><span className="spinner" />Searching…</div>
            )}

            {!policeLoading && policeList.length === 0 && (
              <div className="pp-empty">No stations found nearby.</div>
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
                <div className="pi-bot">
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

        <div className="sos-actions">
          {/* Police button */}
          <button className="sos-btn police" onClick={loadPolice}>
            <span className="sos-btn-icon">🚨</span>
            <span className="sos-btn-copy">
              <span className="sos-btn-title">
                {policeLoading ? "Searching..." : "Nearest Police"}
              </span>
              <span className="sos-btn-sub">Rapid station access</span>
            </span>
          </button>

          {/* Emergency call */}
          <button className="sos-btn emergency" onClick={() => {
            if (!userPos) return alert("User location not available");
            axios.post("http://localhost:5000/api/send-emergency",
              { lat: userPos[0], lng: userPos[1] }).catch(console.error);
            alert("Calling Police: 100 & Women Safety: 1091");
            window.open("tel:100"); window.open("tel:1091");
          }}>
            <span className="sos-btn-icon">📞</span>
            <span className="sos-btn-copy">
              <span className="sos-btn-title">Call Emergency</span>
              <span className="sos-btn-sub">Police and women helpline</span>
            </span>
          </button>
        </div>
      </div>

      {/* Map */}
      <MapContainer center={[18.5204, 73.8567]} zoom={7}
        style={{ height: "100vh", width: "100%" }}>
        <TileLayer url={tileUrl} attribution={tileAttribution} />

        <UserLocation position={userPos} />
        <MapClickHandler setDestination={setDestination} fetchRoute={fetchRoute} />

        {destination && <Marker position={destination}><Popup>Destination</Popup></Marker>}

        {/* Danger zones */}
        {hotspots.map((pt, i) => (
          <Circle key={i} center={[pt.lat, pt.lng]} radius={getRadius(pt.risk)}
            pathOptions={{ color: getColor(pt.risk), fillOpacity: 0.22 }}>
            <Popup><b>{pt.area}</b> ({pt.city})<br />Risk: <b>{pt.risk}</b></Popup>
          </Circle>
        ))}
        {hotspots.map((pt, i) => (
          <CircleMarker key={"d" + i} center={[pt.lat, pt.lng]} radius={4}
            pathOptions={{ color: getColor(pt.risk), fillColor: getColor(pt.risk), fillOpacity: 1 }} />
        ))}

        {/* Police station markers */}
        {policeList.map((stn, i) => (
          <CircleMarker key={"ps" + i} center={[stn.lat, stn.lng]} radius={9}
            pathOptions={{ color: "#fff", fillColor: "#2979ff", fillOpacity: 0.9, weight: 2 }}
            eventHandlers={{ click: () => fetchSafeToPolice(stn, i) }}>
            <Popup>
              <b>{stn.name}</b><br />{fmtDist(stn.distance_m)} away
            </Popup>
          </CircleMarker>
        ))}

        {/* Routes */}
        {route.length > 0 && isUnsafe && (
          <Polyline positions={route}
            pathOptions={{ color: "#ff3b3b", dashArray: "8 6", weight: 4, opacity: .75 }} />
        )}
        {safeRoute.length > 0 && (
          <Polyline positions={safeRoute}
            pathOptions={{ color: "#00e676", weight: 5, opacity: .9 }} />
        )}
        {route.length > 0 && !isUnsafe && (
          <Polyline positions={route}
            pathOptions={{ color: "#2979ff", weight: 5, opacity: .9 }} />
        )}
      </MapContainer>
    </>
  );
};

export default MapView;
