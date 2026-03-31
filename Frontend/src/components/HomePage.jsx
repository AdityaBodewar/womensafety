import React, { useState, useRef } from "react";
import axios from "axios";

/* Inline styles object */
const S = {
  navbar: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    zIndex: 1100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    height: "60px",
    background: "linear-gradient(180deg, rgba(10,8,18,0.97) 0%, rgba(10,8,18,0.0) 100%)",
    backdropFilter: "blur(0px)",
    borderBottom: "1px solid rgba(244,63,94,0.10)",
  },
  brand: { display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" },
  brandIcon: { width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #f43f5e 0%, #7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", boxShadow: "0 0 16px rgba(244,63,94,0.4)", flexShrink: 0 },
  brandText: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: "16px", fontWeight: "700", color: "#f5f0ff", letterSpacing: "0.3px" },
  brandSub: { fontSize: "9px", fontWeight: "500", color: "#8b7fa8", letterSpacing: "2px", textTransform: "uppercase", display: "block", lineHeight: "1", marginTop: "1px" },

  searchWrapper: { position: "absolute", top: "70px", left: "50%", transform: "translateX(-50%)", zIndex: 1000, width: "360px", maxWidth: "calc(100vw - 32px)" },
  searchBox: { display: "flex", alignItems: "center", gap: "10px", background: "rgba(18,14,30,0.95)", border: "1px solid rgba(244,63,94,0.25)", borderRadius: "14px", padding: "10px 14px", backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(244,63,94,0.08)", transition: "border-color 0.2s, box-shadow 0.2s" },
  searchBoxFocused: { borderColor: "rgba(244,63,94,0.6)", boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(244,63,94,0.15)" },
  searchIcon: { fontSize: "15px", flexShrink: 0, opacity: 0.7 },
  searchInput: { flex: 1, background: "transparent", border: "none", outline: "none", color: "#f5f0ff", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: "400", letterSpacing: "0.2px" },
  searchClear: { background: "rgba(244,63,94,0.15)", border: "none", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#f43f5e", fontSize: "10px", flexShrink: 0, transition: "background 0.15s" },

  dropdown: { marginTop: "6px", background: "rgba(18,14,30,0.98)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", overflow: "hidden", backdropFilter: "blur(20px)", boxShadow: "0 16px 48px rgba(0,0,0,0.6)", animation: "dropIn 0.15s ease" },
  suggItem: { display: "flex", alignItems: "center", gap: "10px", padding: "11px 14px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.12s", fontFamily: "'DM Sans', sans-serif" },
  suggItemLast: { borderBottom: "none" },
  suggPin: { fontSize: "13px", opacity: 0.6, flexShrink: 0 },
  suggName: { fontSize: "13px", color: "#f5f0ff", lineHeight: "1.4" },
  tag: { display: "inline-block", fontSize: "9px", fontWeight: "600", letterSpacing: "0.8px", textTransform: "uppercase", padding: "2px 7px", borderRadius: "99px", background: "rgba(244,63,94,0.12)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.2)", marginLeft: "auto", flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }
};

/* Keyframe injection */
if (typeof document !== "undefined" && !document.getElementById("hp-anim")) {
  const el = document.createElement("style");
  el.id = "hp-anim";
  el.textContent = `
    @keyframes dropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
    .sugg-item:hover { background: rgba(244,63,94,0.07) !important; }
    .search-clear:hover { background: rgba(244,63,94,0.28) !important; }
    ::placeholder { color: #5a5070 !important; }
  `;
  document.head.appendChild(el);
}

/* HomePage Component */
const HomePage = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/search-location?q=${value}`);
      setSuggestions(res.data);
    } catch (err) {
      console.error(err);
      setSuggestions([]);
    }
  };

  const handleSelect = (place) => {
    setQuery(place.name);
    setSuggestions([]);
    onSearch([place.lat, place.lng]);
    inputRef.current?.blur();
  };

  const clearQuery = () => {
    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Navbar */}
      <nav style={S.navbar}>
        <div style={S.brand}>
          <div style={S.brandIcon}>🛡️</div>
          <div>
            <span style={S.brandText}>SafeHer</span>
            <span style={S.brandSub}>Navigate Safe · Stay Protected</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: "99px", padding: "5px 12px 5px 8px" }}>
          <span style={{ fontSize: "8px", color: "#f43f5e" }}>●</span>
          <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.5px", color: "#f5f0ff", fontFamily: "'DM Sans', sans-serif" }}>Live Tracking</span>
        </div>
      </nav>

      {/* Search */}
      <div style={S.searchWrapper}>
        <div style={{ ...S.searchBox, ...(focused ? S.searchBoxFocused : {}) }}>
          <span style={S.searchIcon}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search a destination…"
            value={query}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 180)}
            style={S.searchInput}
          />
          {query && <button className="search-clear" style={S.searchClear} onClick={clearQuery}>✕</button>}
        </div>

        {suggestions.length > 0 && (
          <div style={S.dropdown}>
            {suggestions.map((place, index) => (
              <div
                key={index}
                className="sugg-item"
                onClick={() => handleSelect(place)}
                style={{ ...S.suggItem, ...(index === suggestions.length - 1 ? S.suggItemLast : {}) }}
              >
                <span style={S.suggPin}>📍</span>
                <span style={S.suggName}>{place.name}</span>
                <span style={S.tag}>Go</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;