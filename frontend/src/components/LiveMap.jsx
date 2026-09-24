import { useEffect, useRef, useState } from "react";
import {
  Layers3,
  Plus,
  Minus,
  Navigation,
  X,
  CloudRain,
  CarFront,
  TriangleAlert,
  Route,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { cityData } from "../data/cityData";

const markerPositions = {
  "Tonk Road": [26.8467, 75.8056],
  "MI Road": [26.9157, 75.801],
  "Ajmer Road": [26.9145, 75.7448],
  Mansarovar: [26.8506, 75.764],
  "Malviya Nagar": [26.8547, 75.8242],
  "C-Scheme": [26.9124, 75.7921],
  Amer: [26.9855, 75.8513],
};

function getMarkerColor(level) {
  if (level === "Critical") return "#ff3155";
  if (level === "High") return "#ff3155";
  if (level === "Moderate") return "#f5a300";
  return "#18c7a0";
}

function getMarkerIcon(level) {
  const color = getMarkerColor(level);

  return L.divIcon({
    className: "citypulse-marker-wrapper",

    html: `
      <div
        class="citypulse-marker"
        style="
          background:${color};
          box-shadow:
            0 0 0 6px rgba(255,255,255,.72),
            0 8px 25px rgba(0,0,0,.22);
        "
      >
        ${
          level === "Critical" || level === "High"
            ? `<span>⚠</span>`
            : level === "Moderate"
            ? `<span class="marker-dot"></span>`
            : `<span>➤</span>`
        }
      </div>
    `,

    iconSize: [58, 58],
    iconAnchor: [29, 29],
  });
}

function LiveMap() {
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);

  const [selectedLocation, setSelectedLocation] = useState(cityData[0]);
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = [
    { name: "All", icon: Layers3 },
    { name: "Traffic", icon: CarFront },
    { name: "Flood", icon: CloudRain },
    { name: "Weather", icon: CloudRain },
    { name: "Accident", icon: TriangleAlert },
    { name: "Road Closure", icon: Route },
  ];

  /* ==========================================================
     CREATE MAP
  ========================================================== */

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    const map = L.map(mapElementRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView([26.9124, 75.7873], 12);

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }
    ).addTo(map);

    /* CUSTOM ZOOM */

    L.control
      .zoom({
        position: "topleft",
      })
      .addTo(map);

    /* MARKERS */

    cityData.forEach((location) => {
      const position = markerPositions[location.location];

      if (!position) return;

      const marker = L.marker(position, {
        icon: getMarkerIcon(location.risk.level),
      }).addTo(map);

      marker.on("click", () => {
        setSelectedLocation(location);

        map.flyTo(position, 13, {
          duration: 0.8,
        });
      });
    });

    mapRef.current = map;

    /* IMPORTANT:
       Leaflet must recalculate the dimensions after
       the React container has rendered.
    */

    setTimeout(() => {
      map.invalidateSize();
    }, 300);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    resizeObserver.observe(mapElementRef.current);

    return () => {
      resizeObserver.disconnect();

      map.remove();

      mapRef.current = null;
    };
  }, []);

  /* ==========================================================
     MAP FILTER
  ========================================================== */

  const handleFilter = (filter) => {
    setActiveFilter(filter);

    if (!mapRef.current) return;

    if (filter === "All") {
      mapRef.current.setView([26.9124, 75.7873], 12);
      return;
    }

    let target = null;

    if (filter === "Traffic") {
      target = cityData.find(
        (item) => item.traffic.change >= 20
      );
    }

    if (filter === "Flood") {
      target = cityData.find(
        (item) => item.rainfall.current >= 15
      );
    }

    if (filter === "Weather") {
      target = cityData.find(
        (item) => item.rainfall.change >= 50
      );
    }

    if (filter === "Accident") {
      target = cityData.find(
        (item) =>
          item.incidents.type === "Road Incident"
      );
    }

    if (filter === "Road Closure") {
      target = cityData.find(
        (item) =>
          item.incidents.type === "Road Closure"
      );
    }

    if (target) {
      setSelectedLocation(target);

      const position =
        markerPositions[target.location];

      mapRef.current.flyTo(position, 13, {
        duration: 0.8,
      });
    }
  };

  /* ==========================================================
     LOCATE JAIPUR
  ========================================================== */

  const locateCity = () => {
    if (!mapRef.current) return;

    mapRef.current.flyTo(
      [26.9124, 75.7873],
      12,
      {
        duration: 0.8,
      }
    );
  };

  /* ==========================================================
     CLOSE DETAILS
  ========================================================== */

  const closeDetails = () => {
    setSelectedLocation(null);
  };

  return (
    <div className="citypulse-live-map">

      {/* =====================================================
          TOP FILTER BAR
      ===================================================== */}

      <div className="live-map-filters">

        {filters.map((filter) => {
          const Icon = filter.icon;

          return (
            <button
              key={filter.name}
              className={
                activeFilter === filter.name
                  ? "map-filter active"
                  : "map-filter"
              }
              onClick={() =>
                handleFilter(filter.name)
              }
            >
              <Icon size={17} />

              <span>{filter.name}</span>
            </button>
          );
        })}

      </div>

      {/* =====================================================
          MAP + DETAILS
      ===================================================== */}

      <div className="live-map-layout">

        {/* =================================================
            MAP
        ================================================= */}

        <div className="live-map-card">

          <div
            ref={mapElementRef}
            className="citypulse-leaflet-map"
          />

          {/* MAP LABEL */}

          <div className="map-city-label">
            Jaipur
          </div>

          {/* LOCATION BUTTON */}

          <button
            className="map-locate-button"
            onClick={locateCity}
            title="Locate Jaipur"
          >
            <Navigation size={21} />
          </button>

          {/* MAP LAYERS */}

          <button className="map-layers-button">
            <Layers3 size={18} />
            <span>Map Layers</span>
          </button>

          {/* LEGEND */}

          <div className="map-legend">

            <span>
              <i className="legend-dot high"></i>
              High Risk
            </span>

            <span>
              <i className="legend-dot moderate"></i>
              Moderate
            </span>

            <span>
              <i className="legend-dot low"></i>
              Low Risk
            </span>

            <span>
              <i className="legend-dot incident"></i>
              Incident
            </span>

          </div>

        </div>

        {/* =================================================
            DETAILS PANEL
        ================================================= */}

        {selectedLocation && (
          <div className="location-details">

            {/* HEADER */}

            <div className="details-header">

              <div className="monitor-badge">
                <TriangleAlert size={14} />
                MONITOR
              </div>

              <button
                className="details-close"
                onClick={closeDetails}
              >
                <X size={20} />
              </button>

            </div>

            <h2>
              {selectedLocation.location}{" "}
              {selectedLocation.incidents.type ||
                "Monitoring"}
            </h2>

            <div className="details-location">
              <Navigation size={16} />

              {selectedLocation.location}, Jaipur
            </div>

            {/* =================================================
                METRIC CARDS
            ================================================= */}

            <div className="location-metrics">

              <div className="location-metric">

                <CloudRain size={23} />

                <span>Rainfall</span>

                <strong>
                  {selectedLocation.rainfall.current} mm
                </strong>

                <small>
                  ↑ {selectedLocation.rainfall.change}%
                </small>

              </div>

              <div className="location-metric">

                <CarFront size={23} />

                <span>Traffic</span>

                <strong>
                  +{selectedLocation.traffic.change}%
                </strong>

                <small>
                  {selectedLocation.traffic.level}
                </small>

              </div>

              <div className="location-metric">

                <Route size={23} />

                <span>Blocked Roads</span>

                <strong>
                  {selectedLocation.roads.blocked}
                </strong>

                <small>
                  {selectedLocation.roads.blocked > 0
                    ? "Major impact"
                    : "No impact"}
                </small>

              </div>

            </div>

            {/* =================================================
                RISK SCORE
            ================================================= */}

            <div className="risk-score-section">

              <div className="risk-number">
                <strong>
                  {selectedLocation.risk.score}
                </strong>

                <span>/100</span>
              </div>

              <div className="risk-description">

                <span>RISK SCORE</span>

                <strong
                  className={
                    selectedLocation.risk.level
                      .toLowerCase()
                  }
                >
                  {selectedLocation.risk.level}
                </strong>

              </div>

            </div>

            {/* =================================================
                AI ANALYSIS
            ================================================= */}

            <div className="ai-analysis-box">

              <div className="analysis-header">

                <div>
                  <Sparkles size={17} />
                  <strong>AI Analysis</strong>
                </div>

                <span>
                  Confidence: 87%
                </span>

              </div>

              <p>
                Heavy rainfall combined with increased
                traffic is creating elevated civic risk
                in this zone. If rainfall continues at
                this rate, nearby roads may also
                experience flooding.
              </p>

            </div>

            {/* =================================================
                RECOMMENDED ACTIONS
            ================================================= */}

            <div className="recommended-box">

              <h3>
                💡 Recommended Actions
              </h3>

              <ul>
                <li>
                  Monitor nearby intersections
                </li>

                <li>
                  Check alternate routes
                </li>

                <li>
                  Notify affected zones
                </li>

                <li>
                  Track rainfall for next 30 minutes
                </li>
              </ul>

              <button>
                View affected roads
                <ArrowRight size={15} />
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default LiveMap;