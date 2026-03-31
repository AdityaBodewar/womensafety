from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import requests
import math

app = Flask(__name__)
CORS(app)


try:
    df = pd.read_csv("maharashtra_area_risk_summary_with_coords.csv")
    df = df.rename(columns={"latitude": "lat", "longitude": "lng", "risk_level": "risk"})
    df['lat'] = df['lat'].astype(float)
    df['lng'] = df['lng'].astype(float)
except Exception as e:
    print("Error loading CSV:", e)
    df = pd.DataFrame()

def haversine(lat1, lng1, lat2, lng2):
    R = 6371000
    to_rad = lambda x: x * math.pi / 180
    dlat = to_rad(lat2 - lat1)
    dlng = to_rad(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(to_rad(lat1)) * math.cos(to_rad(lat2)) * math.sin(dlng / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def _risk_radius(risk):
    return {"high": 1000, "medium": 500, "low": 200}.get(risk.lower(), 300)

def _point_in_danger(lat, lng, hotspots, buffer_m=150):
    for z in hotspots:
        if haversine(lat, lng, z["lat"], z["lng"]) <= _risk_radius(z["risk"]) + buffer_m:
            return True
    return False

def _build_safe_waypoints(start, end, hotspots):
    STEPS = 12
    path = [
        [start[0] + (end[0] - start[0]) * i / STEPS,
         start[1] + (end[1] - start[1]) * i / STEPS]
        for i in range(STEPS + 1)
    ]
    blocking = []
    for z in hotspots:
        radius = _risk_radius(z["risk"])
        if any(haversine(p[0], p[1], z["lat"], z["lng"]) <= radius + 200 for p in path):
            blocking.append(z)
    if not blocking:
        return []
    waypoints = []
    dlat = end[0] - start[0]
    dlng = end[1] - start[1]
    length = math.sqrt(dlat ** 2 + dlng ** 2) or 1e-9
    perp_lat = -dlng / length
    perp_lng =  dlat / length
    for z in blocking:
        radius = _risk_radius(z["risk"])
        offset_deg = (radius + 600) / 111320
        for sign in (1, -1, 2, -2):
            candidate = [z["lat"] + perp_lat * offset_deg * sign,
                         z["lng"] + perp_lng * offset_deg * sign]
            if not _point_in_danger(candidate[0], candidate[1], hotspots):
                waypoints.append(candidate)
                break
    return waypoints


OSRM_URL = "http://router.project-osrm.org/route/v1/driving/"



@app.route("/api/hotspots", methods=["GET"])
def get_hotspots():
    try:
        filtered = df[df['risk'].isin(["High", "Medium"])]
        result = filtered[['area', 'city', 'lat', 'lng', 'risk']].to_dict(orient='records')
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/api/route", methods=["POST"])
def get_route():
    try:
        data  = request.json
        start = data.get("start")
        end   = data.get("end")
        if not start or not end:
            return jsonify({"error": "Start and End required"}), 400
        coord_str = f"{start[1]},{start[0]};{end[1]},{end[0]}"
        url       = OSRM_URL + coord_str + "?overview=full&geometries=geojson"
        response  = requests.get(url, timeout=10)
        if response.status_code != 200:
            return jsonify({"error": "OSRM server error"}), 500
        result = response.json()
        if "routes" not in result or len(result["routes"]) == 0:
            return jsonify({"error": "Route not found"}), 400
        return jsonify({"route": result["routes"][0]["geometry"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/api/safe-route", methods=["POST"])
def get_safe_route():
    try:
        data     = request.json
        start    = data.get("start")
        end      = data.get("end")
        hotspots = data.get("hotspots")
        if not start or not end or hotspots is None:
            return jsonify({"error": "start, end, and hotspots are required"}), 400
        waypoints  = _build_safe_waypoints(start, end, hotspots)
        all_points = [start] + waypoints + [end]
        coord_str  = ";".join(f"{p[1]},{p[0]}" for p in all_points)
        url = f"{OSRM_URL}{coord_str}?overview=full&geometries=geojson"
        resp = requests.get(url, timeout=15)
        if resp.status_code != 200:
            return jsonify({"error": "OSRM server error"}), 500
        result = resp.json()
        if "routes" not in result or not result["routes"]:
            return jsonify({"error": "Safe route not found"}), 400
        return jsonify({
            "route": result["routes"][0]["geometry"],
            "waypoints_used": waypoints
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500








@app.route("/api/search-location", methods=["GET"])
def search_location():
    try:
        query = request.args.get("q")
        if not query:
            return jsonify([])  

        
        response = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={
                "q": query,
                "format": "json",
                "addressdetails": 1,  
                "limit": 5
            },
            headers={"User-Agent": "women-safety-app"},
            timeout=10
        )

        if response.status_code != 200:
            return jsonify([]) 

        results = []
        for place in response.json():
            addr = place.get("address", {})
           
            if addr.get("state") == "Maharashtra":
                results.append({
                    "name": place.get("display_name"),
                    "lat": float(place.get("lat")),
                    "lng": float(place.get("lon"))
                })

        return jsonify(results)

    except Exception as e:
        return jsonify([]) 

if __name__ == "__main__":
    app.run(debug=True)



@app.route("/api/nearest_police_real", methods=["POST"])
def nearest_police_real():
    data     = request.json
    lat, lng = data["lat"], data["lng"]
    overpass_query = f"""
    [out:json];
    node["amenity"="police"](around:10000,{lat},{lng});
    out center;
    """
    try:
        res      = requests.post(
            "https://overpass-api.de/api/interpreter",
            data=overpass_query,
            headers={"Content-Type": "text/plain"},
            timeout=15
        )
        stations = res.json().get("elements", [])
        if not stations:
            return jsonify({"error": "No nearby police found"}), 404
        nearest = min(stations, key=lambda s: haversine(lat, lng, s['lat'], s['lon']))
        dist_m  = haversine(lat, lng, nearest['lat'], nearest['lon'])
        return jsonify({
            "nearest_police": {
                "name":        nearest.get('tags', {}).get('name', 'Unnamed Police Station'),
                "lat":         nearest['lat'],
                "lng":         nearest['lon'],
                "distance_m":  int(dist_m),
                "distance_km": round(dist_m / 1000, 2)
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/api/nearest_police_list", methods=["POST"])
def nearest_police_list():
    """
    Returns up to 5 nearest police stations sorted by distance.
    Each entry: { name, lat, lng, distance_m, distance_km }
    """
    data     = request.json
    lat, lng = data["lat"], data["lng"]

    overpass_query = f"""
    [out:json];
    node["amenity"="police"](around:15000,{lat},{lng});
    out center;
    """
    try:
        res      = requests.post(
            "https://overpass-api.de/api/interpreter",
            data=overpass_query,
            headers={"Content-Type": "text/plain"},
            timeout=20
        )
        elements = res.json().get("elements", [])

        if not elements:
            return jsonify({"stations": []})

        scored = []
        for s in elements:
            dist_m = haversine(lat, lng, s["lat"], s["lon"])
            scored.append({
                "name":        s.get("tags", {}).get("name", "Unnamed Police Station"),
                "lat":         s["lat"],
                "lng":         s["lon"],
                "distance_m":  int(dist_m),
                "distance_km": round(dist_m / 1000, 2)
            })

        scored.sort(key=lambda x: x["distance_m"])
        return jsonify({"stations": scored[:5]})

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/api/send-emergency", methods=["POST"])
def send_emergency():
    data = request.json
    print(f"EMERGENCY at {data.get('lat')}, {data.get('lng')}")
    return jsonify({"status": "ok"})



@app.route("/")
def home():
    return jsonify({"message": "Women Safety API running 🚀"})


if __name__ == "__main__":
    app.run(debug=True)