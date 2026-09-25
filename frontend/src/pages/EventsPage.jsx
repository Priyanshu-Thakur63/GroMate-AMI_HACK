import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useState, useEffect } from "react";

import {
  AlertTriangle,
  Activity,
  MapPin,
  CloudRain,
  CarFront,
  Construction,
  Clock3,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import { eventFeed } from "../data/cityData";
import { apiService } from "../services/api";

function getEventIcon(type) {
  switch (type) {
    case "rainfall":
    case "rain":
      return <CloudRain size={20} />;
    case "traffic":
      return <CarFront size={20} />;
    case "road":
      return <Construction size={20} />;
    case "incident":
    default:
      return <AlertTriangle size={20} />;
  }
}

function EventsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [events, setEvents] = useState(eventFeed);

  useEffect(() => {
    apiService.fetchIncidents().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        const liveMapped = res.data.map((item, idx) => ({
          id: item.id || idx + 10,
          time: new Date(item.reportedAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: item.category === "WATERLOGGING" ? "rainfall" : item.category === "TRAFFIC_JAM" ? "traffic" : "incident",
          title: item.title,
          location: item.address || item.zone?.name || "Jaipur",
          value: item.severity,
          severity: item.severity ? item.severity.toLowerCase() : "medium",
          description: item.description,
        }));
        setEvents(liveMapped);
      }
    });
  }, []);

  const totalEvents = events.length;
  const highEvents = events.filter((e) => e.severity?.toLowerCase() === "high" || e.severity?.toLowerCase() === "critical").length;
  const mediumEvents = events.filter((e) => e.severity?.toLowerCase() === "medium").length;
  const lowEvents = events.filter((e) => e.severity?.toLowerCase() === "low").length;

  const locations = {};
  events.forEach((event) => {
    locations[event.location] = (locations[event.location] || 0) + 1;
  });

  const activeLocations = Object.entries(locations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const filteredEvents = events.filter((e) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "rainfall") return e.type === "rainfall" || e.type === "rain";
    if (activeFilter === "traffic") return e.type === "traffic";
    if (activeFilter === "road") return e.type === "road";
    if (activeFilter === "incident") return e.type === "incident";
    return true;
  });

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <Topbar />

        <div className="events-page">
          {/* PAGE HEADER */}
          <div className="events-page-header">
            <div>
              <span className="page-eyebrow">INCIDENT TELEMETRY</span>
              <h1>City Events & Alerts</h1>
              <p>Monitor and analyze the latest civic events and Nagar Nigam 311 reports across Jaipur.</p>
            </div>

            <div className="live-status">
              <span></span>
              LIVE
            </div>
          </div>

          {/* SUMMARY */}
          <div className="events-summary">
            <div className="event-summary-card">
              <div className="event-summary-icon">
                <Activity size={24} />
              </div>
              <div className="event-summary-content">
                <span>Total Events</span>
                <strong>{totalEvents}</strong>
                <small>Detected recently</small>
              </div>
            </div>

            <div className="event-summary-card">
              <div className="event-summary-icon" style={{ background: "#fff0f3", color: "#ff3d59" }}>
                <ShieldAlert size={24} />
              </div>
              <div className="event-summary-content">
                <span>High Priority</span>
                <strong>{highEvents}</strong>
                <small>Requires attention</small>
              </div>
            </div>

            <div className="event-summary-card">
              <div className="event-summary-icon" style={{ background: "#ebfcf6", color: "#12bd83" }}>
                <TrendingUp size={24} />
              </div>
              <div className="event-summary-content">
                <span>Active Locations</span>
                <strong>{Object.keys(locations).length || 6}</strong>
                <small>Across Jaipur</small>
              </div>
            </div>
          </div>

          {/* TOOLBAR */}
          <div className="events-toolbar">
            <div className="event-filter-group">
              <button
                className={`event-filter-button ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                All
              </button>

              <button
                className={`event-filter-button ${activeFilter === "rainfall" ? "active" : ""}`}
                onClick={() => setActiveFilter("rainfall")}
              >
                <CloudRain size={14} />
                Weather
              </button>

              <button
                className={`event-filter-button ${activeFilter === "traffic" ? "active" : ""}`}
                onClick={() => setActiveFilter("traffic")}
              >
                <CarFront size={14} />
                Traffic
              </button>

              <button
                className={`event-filter-button ${activeFilter === "road" ? "active" : ""}`}
                onClick={() => setActiveFilter("road")}
              >
                <Construction size={14} />
                Roads
              </button>

              <button
                className={`event-filter-button ${activeFilter === "incident" ? "active" : ""}`}
                onClick={() => setActiveFilter("incident")}
              >
                <AlertTriangle size={14} />
                Incidents
              </button>
            </div>

            <span className="events-count">
              Showing {filteredEvents.length} events
            </span>
          </div>

          {/* CONTENT */}
          <div className="events-content">
            {/* EVENT LIST */}
            <div className="events-list-card">
              <div className="events-list-header">
                <h2>Recent Events</h2>
                <span style={{ fontSize: "11px", color: "#8092ad" }}>Updated live</span>
              </div>

              <div className="events-list">
                {filteredEvents.map((event) => (
                  <div className={`event-row ${event.severity}`} key={event.id}>
                    <div className="event-row-icon">
                      {getEventIcon(event.type)}
                    </div>

                    <div className="event-row-info">
                      <div className="event-row-title">{event.title}</div>
                      <div className="event-row-location">
                        <MapPin size={12} />
                        {event.location}
                      </div>
                      <div className="event-row-description">{event.description}</div>
                    </div>

                    <div className="event-row-value">{event.value}</div>

                    <div className={`event-severity ${event.severity}`}>
                      {event.severity?.toUpperCase()}
                    </div>

                    <div className="event-row-time">
                      <Clock3 size={11} style={{ display: "inline", marginRight: "3px" }} />
                      {event.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <aside>
              <div className="events-side-card">
                <div className="events-side-header">
                  <h2>Event Severity</h2>
                  <ShieldAlert size={18} color="#ff3d59" />
                </div>

                <div className="severity-breakdown">
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                      <span>High Priority</span>
                      <strong>{highEvents}</strong>
                    </div>
                    <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${(highEvents / (totalEvents || 1)) * 100}%`, height: "100%", background: "#ff3d59" }}></div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                      <span>Medium Priority</span>
                      <strong>{mediumEvents}</strong>
                    </div>
                    <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${(mediumEvents / (totalEvents || 1)) * 100}%`, height: "100%", background: "#f5a300" }}></div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                      <span>Low Priority</span>
                      <strong>{lowEvents}</strong>
                    </div>
                    <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${(lowEvents / (totalEvents || 1)) * 100}%`, height: "100%", background: "#2874ef" }}></div>
                    </div>
                  </div>
                </div>

                {/* LOCATIONS */}
                <div style={{ marginTop: "20px", borderTop: "1px solid #edf2f7", paddingTop: "14px" }}>
                  <h3 style={{ fontSize: "13px", fontWeight: "700", marginBottom: "10px" }}>Most Active Locations</h3>

                  {activeLocations.map(([location, count], index) => (
                    <div
                      key={location}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 0",
                        fontSize: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#edf4ff", color: "#2874ef", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "800" }}>
                          {index + 1}
                        </span>
                        <strong>{location}</strong>
                      </div>
                      <span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", fontWeight: "700" }}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EventsPage;