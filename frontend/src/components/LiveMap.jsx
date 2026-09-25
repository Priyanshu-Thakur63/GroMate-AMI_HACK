import { useEffect, useRef, useState } from "react";
import {
  Navigation,
  X,
  CloudRain,
  CarFront,
  TriangleAlert,
  Route,
  Sparkles,
  Wind,
  Activity,
  CheckCircle2,
  ShieldAlert,
  Radio,
  Thermometer,
  SlidersHorizontal,
  Send,
  Flame,
  Volume2,
  Gauge,
  Clock,
  TrendingDown,
  Droplets,
  Compass,
  AlertTriangle,
  Info,
  ShieldCheck,
  Zap,
  BarChart3
} from "lucide-react";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { cityData } from "../data/cityData";
import { apiService } from "../services/api";

function getMarkerColor(status) {
  if (status === "CRITICAL" || status === "Critical" || status === "High") return "#ff3358";
  if (status === "ELEVATED" || status === "ELEVATED_ALERT" || status === "Moderate") return "#f59e0b";
  return "#10b981";
}

function getAQIColor(aqi) {
  if (aqi > 200) return "#8b5cf6";
  if (aqi > 150) return "#ef4444";
  if (aqi > 100) return "#f59e0b";
  if (aqi > 50) return "#eab308";
  return "#10b981";
}

function getRainColor(rain) {
  if (rain > 20) return "#7c3aed";
  if (rain > 10) return "#2563eb";
  if (rain > 0) return "#0284c7";
  return "#38bdf8";
}

// Generate rich dynamic HTML marker icons tailored to the active filter mode
function createDynamicMarkerIcon(zone, activeMode, matchingCorridor) {
  const isAlert = zone.statusLabel === "CRITICAL" || zone.statusLabel === "Critical";
  const isElevated = zone.statusLabel === "ELEVATED" || zone.statusLabel === "ELEVATED_ALERT";
  const mainColor = getMarkerColor(zone.statusLabel);

  let badgeValue = `${zone.overallScore}`;
  let badgeUnit = "/100";
  let modeBadge = "PULSE";
  let modeColor = mainColor;

  if (activeMode === "Traffic") {
    if (matchingCorridor) {
      badgeValue = `${matchingCorridor.currentSpeed}`;
      badgeUnit = " km/h";
      modeBadge = matchingCorridor.level === "Heavy Congestion" ? "JAM" : matchingCorridor.level === "Moderate Traffic" ? "SLOW" : "FLUID";
      modeColor = matchingCorridor.statusColor;
    } else {
      badgeValue = zone.activeIncidents > 0 ? `${zone.activeIncidents} Alerts` : "Clear";
      badgeUnit = "";
      modeBadge = "TRAFFIC";
      modeColor = zone.activeIncidents > 0 ? "#ef4444" : "#10b981";
    }
  } else if (activeMode === "Flood") {
    badgeValue = `${zone.rainfall}`;
    badgeUnit = " mm";
    modeBadge = "RAIN";
    modeColor = getRainColor(zone.rainfall);
  } else if (activeMode === "AQI") {
    badgeValue = `${zone.aqi}`;
    badgeUnit = " AQI";
    modeBadge = zone.aqiCategory || "AIR";
    modeColor = getAQIColor(zone.aqi);
  } else if (activeMode === "Incidents") {
    badgeValue = `${zone.activeIncidents}`;
    badgeUnit = " Active";
    modeBadge = "HAZARDS";
    modeColor = zone.activeIncidents > 0 ? "#ff3358" : "#10b981";
  }

  const pulseClass = isAlert ? "marker-pulse-critical" : isElevated ? "marker-pulse-elevated" : "marker-pulse-normal";

  return L.divIcon({
    className: "custom-leaflet-marker-wrapper",
    html: `
      <div class="leaflet-citypulse-pin ${pulseClass}" style="--pin-color: ${modeColor}">
        <div class="pin-halo"></div>
        <div class="pin-card">
          <div class="pin-header">
            <span class="pin-code">${zone.code || zone.name.slice(0, 3).toUpperCase()}</span>
            <span class="pin-mode-tag" style="background: ${modeColor}20; color: ${modeColor}; border: 1px solid ${modeColor}40;">${modeBadge}</span>
          </div>
          <div class="pin-body">
            <strong class="pin-value" style="color: ${modeColor}">${badgeValue}</strong>
            <span class="pin-unit">${badgeUnit}</span>
          </div>
          <div class="pin-title">${zone.name}</div>
        </div>
        <div class="pin-pointer" style="border-top-color: ${modeColor}"></div>
      </div>
    `,
    iconSize: [110, 68],
    iconAnchor: [55, 68],
    popupAnchor: [0, -68],
  });
}

function LiveMap() {
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);
  const corridorsGroupRef = useRef(null);

  const [zonesList, setZonesList] = useState([]);
  const [trafficCorridors, setTrafficCorridors] = useState([]);
  const [trafficSummary, setTrafficSummary] = useState({ cityAvgSpeed: 38, cityCongestionIndex: 28 });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedCorridor, setSelectedCorridor] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [detailPresentation, setDetailPresentation] = useState("PULSE");
  const [isLiveFeed, setIsLiveFeed] = useState(false);
  const [showCorridors, setShowCorridors] = useState(true);
  const [actionNotice, setActionNotice] = useState(null);

  const filters = [
    { name: "All", label: "Civic Pulse", icon: Activity, desc: "Composite health score" },
    { name: "Traffic", label: "Traffic & Corridors", icon: CarFront, desc: "Live speed, delays & arterial congestion" },
    { name: "Flood", label: "Rain & Flood Radar", icon: CloudRain, desc: "Live precipitation & weather" },
    { name: "AQI", label: "Air Quality (AQI)", icon: Wind, desc: "PM2.5 & atmospheric metrics" },
    { name: "Incidents", label: "Incidents & Hazards", icon: TriangleAlert, desc: "Active emergency alerts" },
  ];

  /* Automatically synchronize the presentation mode when top-level filter changes */
  useEffect(() => {
    if (activeFilter === "Traffic") setDetailPresentation("TRAFFIC");
    else if (activeFilter === "Flood") setDetailPresentation("WEATHER");
    else if (activeFilter === "AQI") setDetailPresentation("AQI");
    else if (activeFilter === "Incidents") setDetailPresentation("INCIDENTS");
    else setDetailPresentation("PULSE");
  }, [activeFilter]);

  /* Fetch Live Data from Backend REST API */
  useEffect(() => {
    let isMounted = true;

    Promise.all([
      apiService.fetchLivePulse(),
      apiService.fetchTraffic(),
      apiService.fetchIncidents(),
      apiService.fetchWeather()
    ]).then(([pulseRes, trafficRes]) => {
      if (!isMounted) return;

      // 1. Process Traffic Telemetry
      if (trafficRes.success && trafficRes.data?.corridors) {
        setTrafficCorridors(trafficRes.data.corridors);
        setTrafficSummary({
          cityAvgSpeed: trafficRes.data.cityAvgSpeed || 34,
          cityCongestionIndex: trafficRes.data.cityCongestionIndex || 34,
        });
      }

      // 2. Process Zone Pulse & Environmental telemetry
      const rawZones = pulseRes.data?.zonePulses || pulseRes.data?.zoneBreakdown || [];
      if (pulseRes.success && rawZones.length > 0) {
        setIsLiveFeed(true);
        const mappedZones = rawZones.map((z) => {
          const weather = z.feedSnapshots?.weather || {};
          const aq = z.feedSnapshots?.airQuality || {};
          const status = z.statusLabel || "NORMAL";
          const subScores = z.subScores || {
            environmentalScore: 85,
            infrastructureScore: 90,
            sentimentScore: 78,
            disasterImpactScore: 95
          };

          return {
            id: z.zoneId,
            name: z.zoneName,
            code: z.zoneCode,
            lat: z.coordinates?.latitude || 26.9124,
            lon: z.coordinates?.longitude || 75.7873,
            overallScore: z.overallScore,
            statusLabel: status,
            subScores,
            rainfall: weather.precipitation || 0,
            temperature: weather.temperature || 31,
            humidity: weather.humidity || 48,
            windSpeed: weather.windSpeed || 14,
            condition: weather.condition || "Clear Sky",
            aqi: aq.aqi || 65,
            aqiCategory: aq.category || "MODERATE",
            pm25: aq.pm2_5 || 22,
            pm10: aq.pm10 || 45,
            no2: aq.no2 || 14,
            o3: aq.o3 || 28,
            activeIncidents: z.feedSnapshots?.activeIncidentCount || 0,
            summaryText: z.summaryText || `Zone ${z.zoneName} running with civic health index of ${z.overallScore}/100.`,
            correlations: z.detectedCorrelations || [],
          };
        });

        setZonesList(mappedZones);
        setSelectedLocation(mappedZones[0]);
      } else {
        // High quality fallback dataset
        const fallback = cityData.map((c) => ({
          id: c.location,
          name: c.location,
          code: c.location.slice(0, 3).toUpperCase(),
          lat:
            c.location === "Tonk Road" ? 26.8467 :
            c.location === "MI Road" ? 26.9157 :
            c.location === "Ajmer Road" ? 26.8820 :
            c.location === "Mansarovar" ? 26.8506 :
            c.location === "Malviya Nagar" ? 26.8530 :
            c.location === "C-Scheme" ? 26.9124 :
            c.location === "Amer" ? 26.9855 : 26.9124,
          lon:
            c.location === "Tonk Road" ? 75.8056 :
            c.location === "MI Road" ? 75.8010 :
            c.location === "Ajmer Road" ? 75.7480 :
            c.location === "Mansarovar" ? 75.7640 :
            c.location === "Malviya Nagar" ? 75.8180 :
            c.location === "C-Scheme" ? 75.7950 :
            c.location === "Amer" ? 75.8513 : 75.7873,
          overallScore: c.risk.score,
          statusLabel: c.risk.level === "Critical" ? "CRITICAL" : c.risk.level === "High" ? "ELEVATED" : "NORMAL",
          subScores: {
            environmentalScore: Math.max(20, 100 - c.rainfall.current * 3),
            infrastructureScore: Math.max(30, 100 - c.roads.blocked * 20),
            sentimentScore: 75,
            disasterImpactScore: c.risk.score < 50 ? 50 : 90
          },
          rainfall: c.rainfall.current,
          temperature: 32,
          humidity: 50,
          windSpeed: 12,
          condition: c.rainfall.current > 10 ? "Heavy Rain" : "Partly Cloudy",
          aqi: c.risk.score > 80 ? 145 : 78,
          aqiCategory: c.risk.score > 80 ? "UNHEALTHY_SENSITIVE" : "MODERATE",
          pm25: c.risk.score > 80 ? 58 : 28,
          pm10: 62,
          no2: 18,
          o3: 32,
          activeIncidents: c.roads.blocked || c.incidents.count || 0,
          summaryText: `Civic risk score is ${c.risk.score}/100 with ${c.traffic.level} traffic density.`,
          correlations: c.rainfall.current > 12 ? [
            { type: "WATERLOGGING_ALERT", severity: "HIGH", message: `Heavy precipitation causing road waterlogging near ${c.location}.` }
          ] : [],
        }));
        setZonesList(fallback);
        setSelectedLocation(fallback[0]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  /* Initialize Leaflet Map */
  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    const map = L.map(mapElementRef.current, {
      zoomControl: false,
      attributionControl: false,
      minZoom: 10,
      maxZoom: 18,
    }).setView([26.895, 75.795], 12);

    // 100% Free OpenStreetMap Standard Tiles (Zero Watermarks)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      subdomains: ["a", "b", "c"],
    }).addTo(map);

    L.control
      .zoom({
        position: "topleft",
      })
      .addTo(map);

    const corridorsGroup = L.layerGroup().addTo(map);
    const layerGroup = L.layerGroup().addTo(map);

    layerGroupRef.current = layerGroup;
    corridorsGroupRef.current = corridorsGroup;
    mapRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

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

  /* Render Arterial Road Corridors with Live Traffic Status */
  useEffect(() => {
    if (!mapRef.current || !corridorsGroupRef.current) return;

    corridorsGroupRef.current.clearLayers();

    if (!showCorridors && activeFilter !== "Traffic") return;

    trafficCorridors.forEach((corridor) => {
      const isCongested = corridor.level === "Heavy Congestion";
      const isModerate = corridor.level === "Moderate Traffic";
      const corridorColor = corridor.statusColor || (isCongested ? "#ef4444" : isModerate ? "#f59e0b" : "#10b981");

      // 1. Outer Glow Polyline
      L.polyline(corridor.coordinates, {
        color: corridorColor,
        weight: isCongested || activeFilter === "Traffic" ? 10 : 7,
        opacity: isCongested ? 0.45 : 0.25,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(corridorsGroupRef.current);

      // 2. Core Road Polyline
      const line = L.polyline(corridor.coordinates, {
        color: corridorColor,
        weight: activeFilter === "Traffic" ? 4.5 : 3.5,
        opacity: 0.95,
        dashArray: isCongested ? "7, 7" : undefined,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(corridorsGroupRef.current);

      // 3. Interactive Corridor Tooltip
      line.bindTooltip(
        `
        <div class="traffic-corridor-tooltip">
          <div class="corridor-tip-header">
            <strong>${corridor.name}</strong>
            <span class="corridor-speed-tag" style="background: ${corridorColor}25; color: ${corridorColor};">
              ${corridor.currentSpeed} km/h
            </span>
          </div>
          <div class="corridor-tip-status" style="color: ${corridorColor}">
            ${isCongested ? `⚠️ ${corridor.level} (+${corridor.delayMin}m delay)` : `✓ ${corridor.level}`}
          </div>
          <div class="corridor-tip-hint">Click corridor to inspect telemetry</div>
        </div>
      `,
        { sticky: true, className: "leaflet-corridor-rich-tooltip", opacity: 0.98 }
      );

      // On Corridor Click
      line.on("click", () => {
        setSelectedCorridor(corridor);
        setDetailPresentation("TRAFFIC");
        const matchingZone = zonesList.find((z) => z.code === corridor.zoneCode);
        if (matchingZone) {
          setSelectedLocation(matchingZone);
        }
      });
    });
  }, [showCorridors, trafficCorridors, activeFilter, zonesList]);

  /* Render Markers & Circles */
  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current || zonesList.length === 0) return;

    layerGroupRef.current.clearLayers();

    zonesList.forEach((zone) => {
      const matchingCorridor = trafficCorridors.find((c) => c.zoneCode === zone.code || c.name.includes(zone.name));

      const isVisible =
        activeFilter === "All" ||
        (activeFilter === "Traffic" && (matchingCorridor?.level === "Heavy Congestion" || zone.activeIncidents > 0 || zone.overallScore < 85)) ||
        (activeFilter === "Flood" && (zone.rainfall > 0 || zone.overallScore < 80)) ||
        (activeFilter === "AQI" && zone.aqi >= 50) ||
        (activeFilter === "Incidents" && zone.activeIncidents > 0);

      if (!isVisible && activeFilter !== "All") return;

      const markerColor =
        activeFilter === "Traffic" && matchingCorridor
          ? matchingCorridor.statusColor
          : getMarkerColor(zone.statusLabel);

      // Zone Radius Radar Circle
      const circle = L.circle([zone.lat, zone.lon], {
        radius: 1400,
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: activeFilter === "Flood" ? 0.25 : activeFilter === "Traffic" ? 0.16 : 0.12,
        weight: 2,
        dashArray: zone.statusLabel === "CRITICAL" ? "5, 5" : undefined,
      }).addTo(layerGroupRef.current);

      // Zone Dynamic HTML Marker
      const marker = L.marker([zone.lat, zone.lon], {
        icon: createDynamicMarkerIcon(zone, activeFilter, matchingCorridor),
      }).addTo(layerGroupRef.current);

      // Interactive Tooltip
      marker.bindTooltip(
        `
        <div class="leaflet-hover-preview">
          <div class="hover-head">
            <strong>${zone.name}</strong>
            <span class="hover-status ${zone.statusLabel.toLowerCase()}">${zone.statusLabel}</span>
          </div>
          <div class="hover-grid">
            <div>Score: <strong>${zone.overallScore}/100</strong></div>
            <div>Speed: <strong>${matchingCorridor ? `${matchingCorridor.currentSpeed} km/h` : "38 km/h"}</strong></div>
            <div>Rain: <strong>${zone.rainfall} mm</strong></div>
            <div>AQI: <strong>${zone.aqi}</strong></div>
          </div>
          <div class="hover-footer">Click to inspect zone resilience</div>
        </div>
      `,
        {
          direction: "top",
          offset: [0, -70],
          className: "leaflet-rich-preview",
          opacity: 0.98,
        }
      );

      const handleSelect = () => {
        setSelectedLocation(zone);
        setSelectedCorridor(matchingCorridor || null);
        mapRef.current.flyTo([zone.lat, zone.lon], 13.5, { duration: 0.8 });
      };

      marker.on("click", handleSelect);
      circle.on("click", handleSelect);
    });
  }, [zonesList, activeFilter, trafficCorridors]);

  /* Filter Switch Handler */
  const handleFilter = (filterName) => {
    setActiveFilter(filterName);
    if (!mapRef.current) return;

    if (filterName === "All") {
      mapRef.current.flyTo([26.895, 75.795], 12, { duration: 0.8 });
      return;
    }

    if (filterName === "Traffic") {
      setShowCorridors(true);
      const congestedCorridor = trafficCorridors.find((c) => c.level === "Heavy Congestion") || trafficCorridors[0];
      if (congestedCorridor) {
        setSelectedCorridor(congestedCorridor);
        const matched = zonesList.find((z) => z.code === congestedCorridor.zoneCode);
        if (matched) {
          setSelectedLocation(matched);
          mapRef.current.flyTo([matched.lat, matched.lon], 13.5, { duration: 0.8 });
        }
      }
      return;
    }

    const matched = zonesList.find((z) => {
      if (filterName === "Flood") return z.rainfall > 0 || z.activeIncidents > 0;
      if (filterName === "AQI") return z.aqi >= 70;
      if (filterName === "Incidents") return z.activeIncidents > 0;
      return true;
    });

    if (matched) {
      setSelectedLocation(matched);
      mapRef.current.flyTo([matched.lat, matched.lon], 13.5, { duration: 0.8 });
    }
  };

  const locateCity = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([26.895, 75.795], 12, { duration: 0.8 });
  };

  // Interactive Action Handlers
  const handleDispatchTeam = (zoneName) => {
    setActionNotice({
      type: "DISPATCH",
      title: "Municipal Quick Response Dispatched",
      message: `Emergency traffic & field unit dispatched to ${zoneName}. Field operatives notified.`,
    });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleIssueAdvisory = (zoneName) => {
    setActionNotice({
      type: "ADVISORY",
      title: "Citizen Advisory Broadcasted",
      message: `Live advisory broadcasted for ${zoneName} municipal ward across SMS & Mobile network.`,
    });
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="citypulse-live-map">
      <div className="live-map-card">
        {/* Top Filter & Control Bar */}
        <div className="live-map-filters">
          <div className="filter-buttons-group">
            {filters.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.name;
              return (
                <button
                  key={filter.name}
                  className={`map-filter ${isActive ? "active" : ""}`}
                  onClick={() => handleFilter(filter.name)}
                  title={filter.desc}
                >
                  <Icon size={14} />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>

          <div className="map-toolbar-right">
            {/* Live Traffic Telemetry Pill */}
            <div className="traffic-ribbon-pill" title="Live City Traffic Telemetry">
              <CarFront size={13} color="#2563eb" />
              <span>Avg Speed: <strong>{trafficSummary.cityAvgSpeed} km/h</strong></span>
              <span className="ribbon-divider">•</span>
              <span>Congestion: <strong>{trafficSummary.cityCongestionIndex}%</strong></span>
            </div>

            {/* Toggle Corridors */}
            <button
              className={`map-tool-btn ${showCorridors ? "active" : ""}`}
              onClick={() => setShowCorridors(!showCorridors)}
              title="Toggle Jaipur Arterial Road Corridors"
            >
              <Route size={14} />
              <span>{showCorridors ? "Corridors: ON" : "Corridors: OFF"}</span>
            </button>

            {/* Live DB Sync Heartbeat */}
            <div className="live-sync-indicator">
              <span className="live-heartbeat-dot"></span>
              <span>{isLiveFeed ? "PostgreSQL Live Sync" : "Live API Stream"}</span>
            </div>
          </div>
        </div>

        {/* Action Toast Notification */}
        {actionNotice && (
          <div className="map-action-toast">
            <CheckCircle2 size={18} color="#10b981" />
            <div>
              <strong>{actionNotice.title}</strong>
              <p>{actionNotice.message}</p>
            </div>
            <button onClick={() => setActionNotice(null)} className="toast-close-btn">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Map + Side Panel Layout */}
        <div className="live-map-layout">
          <div className="map-canvas-container">
            <div ref={mapElementRef} className="citypulse-leaflet-map" />

            {/* Floating City & Layer Badge */}
            <div className="map-city-label">
              <Radio size={12} className="live-spin" />
              <span>Jaipur Grid • {activeFilter === "All" ? "Composite Resilience" : activeFilter === "Traffic" ? "Live Arterial Traffic" : activeFilter}</span>
            </div>

            {/* Recenter Map Button */}
            <button
              className="map-locate-button"
              onClick={locateCity}
              title="Center Jaipur Municipal Grid"
            >
              <Navigation size={16} />
            </button>

            {/* Live Map Legend */}
            <div className="map-legend">
              <div className="legend-header">
                {activeFilter === "Traffic" ? "Traffic Flow" : "Zone Resilience"}
              </div>
              <div className="legend-items">
                {activeFilter === "Traffic" ? (
                  <>
                    <span><i className="legend-dot high"></i>Heavy Congestion (&lt;15 km/h)</span>
                    <span><i className="legend-dot moderate"></i>Moderate (15-35 km/h)</span>
                    <span><i className="legend-dot low"></i>Fluid (&gt;35 km/h)</span>
                  </>
                ) : (
                  <>
                    <span><i className="legend-dot high"></i>Critical Alert (&lt;50)</span>
                    <span><i className="legend-dot moderate"></i>Elevated (50-79)</span>
                    <span><i className="legend-dot low"></i>Optimal (&ge;80)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Context-Adaptive Data Presentation Drawer */}
          {selectedLocation ? (
            <div className="location-details">
              <div className="details-header">
                <div className={`monitor-badge ${selectedLocation.statusLabel === "CRITICAL" ? "high" : selectedLocation.statusLabel === "ELEVATED" ? "elevated" : "normal"}`}>
                  <ShieldAlert size={13} />
                  {selectedLocation.statusLabel || "MONITORED"}
                </div>
                <button
                  className="details-close"
                  onClick={() => { setSelectedLocation(null); setSelectedCorridor(null); }}
                  title="Close Details"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="details-title-row">
                <h2>{selectedCorridor && detailPresentation === "TRAFFIC" ? selectedCorridor.name : selectedLocation.name}</h2>
                <span className="zone-code-pill">{selectedLocation.code}</span>
              </div>

              <div className="details-location">
                <Navigation size={13} />
                <span>{selectedLocation.lat.toFixed(4)}°N, {selectedLocation.lon.toFixed(4)}°E • Jaipur Municipal Corp</span>
              </div>

              {/* Data Presentation Switcher Tabs */}
              <div className="presentation-mode-tabs">
                <button
                  className={`pres-tab ${detailPresentation === "PULSE" ? "active" : ""}`}
                  onClick={() => setDetailPresentation("PULSE")}
                >
                  <Zap size={12} />
                  <span>Resilience</span>
                </button>
                <button
                  className={`pres-tab ${detailPresentation === "WEATHER" ? "active" : ""}`}
                  onClick={() => setDetailPresentation("WEATHER")}
                >
                  <CloudRain size={12} />
                  <span>Weather</span>
                </button>
                <button
                  className={`pres-tab ${detailPresentation === "AQI" ? "active" : ""}`}
                  onClick={() => setDetailPresentation("AQI")}
                >
                  <Wind size={12} />
                  <span>AQI Health</span>
                </button>
                <button
                  className={`pres-tab ${detailPresentation === "TRAFFIC" ? "active" : ""}`}
                  onClick={() => setDetailPresentation("TRAFFIC")}
                >
                  <CarFront size={12} />
                  <span>Traffic</span>
                </button>
                <button
                  className={`pres-tab ${detailPresentation === "INCIDENTS" ? "active" : ""}`}
                  onClick={() => setDetailPresentation("INCIDENTS")}
                >
                  <TriangleAlert size={12} />
                  <span>Hazards</span>
                </button>
              </div>

              {/* ========================================================================= */}
              {/* PRESENTATION 1: COMPOSITE PULSE & RESILIENCE MATRIX                       */}
              {/* ========================================================================= */}
              {detailPresentation === "PULSE" && (
                <>
                  <div className="risk-score-section">
                    <div className="risk-number">
                      <strong>{selectedLocation.overallScore}</strong>
                      <span>/100</span>
                    </div>
                    <div className="risk-description">
                      <span>COMPOSITE CIVIC HEALTH</span>
                      <strong className={selectedLocation.statusLabel.toLowerCase()}>
                        {selectedLocation.statusLabel}
                      </strong>
                    </div>
                  </div>

                  <div className="civic-pillars-breakdown">
                    <div className="pillars-header">
                      <SlidersHorizontal size={13} />
                      <span>4-Pillar Resilience Breakdown</span>
                    </div>

                    <div className="pillar-row">
                      <div className="pillar-info">
                        <span>🌿 Environmental Index (AQI & Weather)</span>
                        <strong>{selectedLocation.subScores?.environmentalScore || 85}%</strong>
                      </div>
                      <div className="pillar-bar-track">
                        <div className="pillar-bar-fill env" style={{ width: `${selectedLocation.subScores?.environmentalScore || 85}%` }}></div>
                      </div>
                    </div>

                    <div className="pillar-row">
                      <div className="pillar-info">
                        <span>🏗️ Infrastructure & Transit</span>
                        <strong>{selectedLocation.subScores?.infrastructureScore || 90}%</strong>
                      </div>
                      <div className="pillar-bar-track">
                        <div className="pillar-bar-fill infra" style={{ width: `${selectedLocation.subScores?.infrastructureScore || 90}%` }}></div>
                      </div>
                    </div>

                    <div className="pillar-row">
                      <div className="pillar-info">
                        <span>👥 Citizen Sentiment</span>
                        <strong>{selectedLocation.subScores?.sentimentScore || 78}%</strong>
                      </div>
                      <div className="pillar-bar-track">
                        <div className="pillar-bar-fill sent" style={{ width: `${selectedLocation.subScores?.sentimentScore || 78}%` }}></div>
                      </div>
                    </div>

                    <div className="pillar-row">
                      <div className="pillar-info">
                        <span>🛡️ Disaster Preparedness</span>
                        <strong>{selectedLocation.subScores?.disasterImpactScore || 95}%</strong>
                      </div>
                      <div className="pillar-bar-track">
                        <div className="pillar-bar-fill disaster" style={{ width: `${selectedLocation.subScores?.disasterImpactScore || 95}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {selectedLocation.correlations && selectedLocation.correlations.length > 0 && (
                    <div className="correlation-alert-box">
                      <div className="correlation-head">
                        <Flame size={14} color="#ef4444" />
                        <strong>Cross-Feed Multi-Anomaly Detected</strong>
                      </div>
                      {selectedLocation.correlations.map((corr, idx) => (
                        <p key={idx} className="correlation-text">• {corr.message}</p>
                      ))}
                    </div>
                  )}

                  <div className="ai-analysis-box">
                    <div className="analysis-header">
                      <div><Sparkles size={14} /><strong>Live Intelligence</strong></div>
                      <span>Sensor Synchronized</span>
                    </div>
                    <p>{selectedLocation.summaryText}</p>
                  </div>
                </>
              )}

              {/* ========================================================================= */}
              {/* PRESENTATION 2: WEATHER & ATMOSPHERIC STUDIO                               */}
              {/* ========================================================================= */}
              {detailPresentation === "WEATHER" && (
                <div className="weather-presentation-suite">
                  {/* Weather Barometer Hero */}
                  <div className="weather-hero-card">
                    <div className="weather-hero-temp">
                      <Thermometer size={24} color="#2563eb" />
                      <div>
                        <strong>{selectedLocation.temperature}°C</strong>
                        <span>Feels like {selectedLocation.temperature + 2}°C • {selectedLocation.condition}</span>
                      </div>
                    </div>
                    <div className="rain-intensity-badge">
                      <CloudRain size={14} color="#2563eb" />
                      <span>{selectedLocation.rainfall > 15 ? "Heavy Storm" : selectedLocation.rainfall > 0 ? "Scattered Rain" : "Dry / Clear"}</span>
                    </div>
                  </div>

                  {/* Atmospheric Vector Grid */}
                  <div className="weather-vectors-grid">
                    <div className="weather-vector-item">
                      <Droplets size={16} color="#0284c7" />
                      <span className="vector-name">Precipitation</span>
                      <strong>{selectedLocation.rainfall} mm</strong>
                      <small>{selectedLocation.rainfall > 0 ? "Rain accumulation" : "No rainfall"}</small>
                    </div>

                    <div className="weather-vector-item">
                      <Wind size={16} color="#059669" />
                      <span className="vector-name">Wind Speed</span>
                      <strong>{selectedLocation.windSpeed} km/h</strong>
                      <small>ESE Moderate Breeze</small>
                    </div>

                    <div className="weather-vector-item">
                      <Compass size={16} color="#d97706" />
                      <span className="vector-name">Humidity</span>
                      <strong>{selectedLocation.humidity}%</strong>
                      <small>Comfortable Index</small>
                    </div>

                    <div className="weather-vector-item">
                      <BarChart3 size={16} color="#7c3aed" />
                      <span className="vector-name">Barometric</span>
                      <strong>1012 hPa</strong>
                      <small>Stable Pressure</small>
                    </div>
                  </div>

                  {/* Hourly Precipitation Meteogram */}
                  <div className="meteogram-box">
                    <div className="meteogram-head">
                      <span>24-Hour Precipitation Timeline</span>
                      <small>OpenWeather Live Stream</small>
                    </div>
                    <div className="meteogram-bars">
                      {[0, 2, 8, 14, 18, 12, 6, 0, 0].map((v, i) => (
                        <div key={i} className="meteogram-col">
                          <div className="meteogram-fill" style={{ height: `${Math.max(6, v * 3.5)}px` }}></div>
                          <span>{i * 3}:00</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* PRESENTATION 3: AIR QUALITY HEALTH MATRIX (CPCB/EPA SCALE)                */}
              {/* ========================================================================= */}
              {detailPresentation === "AQI" && (
                <div className="aqi-presentation-suite">
                  {/* AQI Spectrum Hero */}
                  <div className="aqi-hero-card" style={{ borderColor: getAQIColor(selectedLocation.aqi) }}>
                    <div className="aqi-hero-score">
                      <strong style={{ color: getAQIColor(selectedLocation.aqi) }}>{selectedLocation.aqi}</strong>
                      <div className="aqi-hero-meta">
                        <span className="aqi-category-chip" style={{ background: `${getAQIColor(selectedLocation.aqi)}20`, color: getAQIColor(selectedLocation.aqi) }}>
                          {selectedLocation.aqiCategory}
                        </span>
                        <small>EPA / CPCB Standard Index</small>
                      </div>
                    </div>
                  </div>

                  {/* Continuous Color Spectrum Bar */}
                  <div className="aqi-spectrum-track">
                    <div className="spectrum-gradient"></div>
                    <div className="spectrum-pointer" style={{ left: `${Math.min(95, Math.max(5, (selectedLocation.aqi / 300) * 100))}%` }}>
                      ▲
                    </div>
                  </div>
                  <div className="spectrum-labels">
                    <span>0 (Good)</span>
                    <span>50</span>
                    <span>100</span>
                    <span>200</span>
                    <span>300+ (Hazardous)</span>
                  </div>

                  {/* Pollutant Breakout Cards */}
                  <div className="pollutant-cards-grid">
                    <div className="pollutant-card">
                      <span className="pollutant-name">PM2.5</span>
                      <strong>{selectedLocation.pm25} µg/m³</strong>
                      <small>Fine Particulate</small>
                    </div>
                    <div className="pollutant-card">
                      <span className="pollutant-name">PM10</span>
                      <strong>{selectedLocation.pm10} µg/m³</strong>
                      <small>Inhalable Dust</small>
                    </div>
                    <div className="pollutant-card">
                      <span className="pollutant-name">NO₂</span>
                      <strong>{selectedLocation.no2 || 14} ppb</strong>
                      <small>Vehicular Emission</small>
                    </div>
                    <div className="pollutant-card">
                      <span className="pollutant-name">O₃</span>
                      <strong>{selectedLocation.o3 || 28} ppb</strong>
                      <small>Ground Ozone</small>
                    </div>
                  </div>

                  {/* Vulnerable Demographic Health Advisory */}
                  <div className="aqi-health-advisory">
                    <div className="advisory-head">
                      <ShieldCheck size={14} color="#059669" />
                      <strong>WHO Civic Health Advisory</strong>
                    </div>
                    <p>
                      {selectedLocation.aqi <= 50
                        ? "Air quality is satisfactory and poses little to no health risk. Ideal for outdoor activities."
                        : selectedLocation.aqi <= 100
                        ? "Air quality is acceptable. Sensitive individuals with respiratory conditions should limit prolonged outdoor exertion."
                        : "Unhealthy for sensitive groups. Children and elderly advised to wear N95 filtration masks."}
                    </p>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* PRESENTATION 4: TRAFFIC & TRANSIT CORRIDOR TELEMETRY                       */}
              {/* ========================================================================= */}
              {detailPresentation === "TRAFFIC" && (
                <div className="traffic-presentation-suite">
                  {/* Selected Corridor / Zone Traffic Telemetry */}
                  {selectedCorridor ? (
                    <>
                      <div className="location-metrics-grid">
                        <div className="location-metric-card">
                          <Gauge size={18} color={selectedCorridor.statusColor} />
                          <span className="metric-label">Current Velocity</span>
                          <strong className="metric-val" style={{ color: selectedCorridor.statusColor }}>
                            {selectedCorridor.currentSpeed} km/h
                          </strong>
                          <small>Base: {selectedCorridor.freeFlowSpeed} km/h</small>
                        </div>

                        <div className="location-metric-card">
                          <TrendingDown size={18} color="#f59e0b" />
                          <span className="metric-label">Congestion Index</span>
                          <strong className="metric-val">{selectedCorridor.congestionPercent}%</strong>
                          <small>{selectedCorridor.level}</small>
                        </div>

                        <div className="location-metric-card">
                          <Clock size={18} color="#ef4444" />
                          <span className="metric-label">Estimated Delay</span>
                          <strong className="metric-val">+{selectedCorridor.delayMin} min</strong>
                          <small>vs Free Flow</small>
                        </div>

                        <div className="location-metric-card">
                          <TriangleAlert size={18} color={selectedCorridor.activeIncidentsCount > 0 ? "#ef4444" : "#10b981"} />
                          <span className="metric-label">Corridor Hazards</span>
                          <strong className="metric-val">{selectedCorridor.activeIncidentsCount}</strong>
                          <small>{selectedCorridor.activeIncidentsCount > 0 ? "Active delays" : "Clear"}</small>
                        </div>
                      </div>

                      <div className="traffic-recommendation-box">
                        <div className="recommendation-header">
                          <Sparkles size={14} color="#2563eb" />
                          <strong>Dynamic Traffic Advisory</strong>
                        </div>
                        <p>{selectedCorridor.recommendation}</p>
                        {selectedCorridor.incidentSummaries && selectedCorridor.incidentSummaries.length > 0 && (
                          <div className="corridor-incident-list">
                            <strong>Bottleneck Reports:</strong>
                            {selectedCorridor.incidentSummaries.map((inc, i) => (
                              <div key={i} className="corridor-inc-item">• {inc}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="all-corridors-list">
                      <div className="corridors-list-head">
                        <strong>Jaipur Arterial Flow Matrix</strong>
                        <span>{trafficCorridors.length} Monitored</span>
                      </div>
                      {trafficCorridors.map((c) => (
                        <div
                          key={c.id}
                          className="corridor-summary-row"
                          onClick={() => setSelectedCorridor(c)}
                        >
                          <div className="corridor-name-col">
                            <strong>{c.name}</strong>
                            <small>{c.lengthKm} km • {c.level}</small>
                          </div>
                          <div className="corridor-speed-col">
                            <strong style={{ color: c.statusColor }}>{c.currentSpeed} km/h</strong>
                            <small>{c.delayMin > 0 ? `+${c.delayMin}m delay` : "On schedule"}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* PRESENTATION 5: CIVIC INCIDENTS & HAZARD TRIAGE                           */}
              {/* ========================================================================= */}
              {detailPresentation === "INCIDENTS" && (
                <div className="incidents-presentation-suite">
                  <div className="incidents-triage-summary">
                    <div className="triage-stat-item">
                      <span className="triage-num red">{selectedLocation.activeIncidents}</span>
                      <span className="triage-label">Active Hazards</span>
                    </div>
                    <div className="triage-stat-item">
                      <span className="triage-num green">0</span>
                      <span className="triage-label">SLA Breaches</span>
                    </div>
                    <div className="triage-stat-item">
                      <span className="triage-num blue">12m</span>
                      <span className="triage-label">Avg Response</span>
                    </div>
                  </div>

                  <div className="incident-triage-card">
                    <div className="incident-triage-head">
                      <AlertTriangle size={15} color="#ef4444" />
                      <strong>Priority Municipal Queue</strong>
                    </div>
                    {selectedLocation.activeIncidents > 0 ? (
                      <div className="active-hazard-item">
                        <div className="hazard-title-row">
                          <strong>Road Congestion & Waterlogging Surcharge</strong>
                          <span className="hazard-sev-badge">HIGH SEVERITY</span>
                        </div>
                        <p>Municipal drains experiencing localized backpressure due to continuous precipitation runoff.</p>
                        <div className="hazard-footer">
                          <span>Status: In Dispatch</span>
                          <span>Assigned: JMC Rapid Unit 04</span>
                        </div>
                      </div>
                    ) : (
                      <div className="all-clear-box">
                        <CheckCircle2 size={24} color="#10b981" />
                        <p>No active critical hazards reported in this zone. All civic infrastructure running smoothly.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Municipal Rapid Operations Action Suite */}
              <div className="zone-action-matrix">
                <h3>⚡ Municipal Command Dispatch</h3>
                <div className="action-buttons-row">
                  <button
                    className="zone-btn-primary"
                    onClick={() => handleDispatchTeam(selectedLocation.name)}
                  >
                    <Send size={13} />
                    <span>Dispatch Field Unit</span>
                  </button>
                  <button
                    className="zone-btn-secondary"
                    onClick={() => handleIssueAdvisory(selectedLocation.name)}
                  >
                    <Volume2 size={13} />
                    <span>Broadcast Advisory</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="location-details empty-state">
              <Navigation size={36} color="#2874ef" />
              <h3>Select a Zone or Corridor</h3>
              <p>Click on any marker or arterial road corridor to inspect contextual data presentations for Weather, AQI, Traffic, and Resilience.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveMap;