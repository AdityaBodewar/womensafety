import React, { useMemo, useState } from "react";
import axios from "axios";
import { MapPin } from "lucide-react";
import { ActionSearchBar } from "@/components/ui/action-search-bar";

const HomePage = ({ isDarkMode = false, onSearch }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleQueryChange = async (value) => {
    setQuery(value);

    if (value.trim().length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/search-location?q=${encodeURIComponent(value)}`,
      );
      setSuggestions(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      setSuggestions({ 'butibori': { "lat": 21.1458, "lng": 79.0882 }, "nagpur": { "lat": 21.1458, "lng": 79.0882 }, "Wardha": { "lat": 20.7284, "lng": 78.5775 } });
    } finally {
      setLoading(false);
    }
  };

  const locationActions = useMemo(() => {
    return suggestions.map((place, index) => {
      const lat = Number(place.lat);
      const lng = Number(place.lng);

      return {
        id: `${index}-${place.name}`,
        label: place.name,
        icon: <MapPin className="h-4 w-4 text-blue-500" />,
        description: place.address
          ? place.address.split(",").slice(1, 3).join(",").trim()
          : Number.isFinite(lat) && Number.isFinite(lng)
            ? `${lat.toFixed(3)}, ${lng.toFixed(3)}`
            : "Suggested location",
        short: "",
        end: "Location",
        payload: place,
      };
    });
  }, [suggestions]);

  const handleActionSelect = (action) => {
    const place = action?.payload;
    if (!place) return;

    setQuery(place.name);
    setSuggestions([]);

    if (typeof onSearch === "function") {
      onSearch([place.lat, place.lng]);
    }
  };

  const emptyMessage =
    query.trim().length < 3
      ? "Type at least 3 characters to search places."
      : loading
        ? "Searching locations..."
        : "No matching locations found.";

  return (
    <div className="absolute left-4 top-4 z-[1050] w-[calc(100%-6rem)] max-w-[420px] sm:left-6 sm:top-6 sm:w-full">
      <ActionSearchBar
        className={`rounded-[26px] border px-4 pb-3 ${isDarkMode
          ? "border-slate-800/80 bg-slate-950/88 shadow-[0_20px_45px_rgba(2,6,23,0.45)]"
          : "border-slate-200/80 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.18)]"
          }`}
        theme={isDarkMode ? "dark" : "light"}
        label="Search Locations"
        placeholder="Search place (e.g. Burdi Nagpur)"
        query={query}
        onQueryChange={handleQueryChange}
        actions={locationActions}
        onActionSelect={handleActionSelect}
        emptyMessage={emptyMessage}
      />
    </div>
  );
};

export default HomePage;
