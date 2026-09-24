import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

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

function getEventIcon(type) {
  switch (type) {
    case "rainfall":
      return <CloudRain size={20} />;

    case "traffic":
      return <CarFront size={20} />;

    case "road":
      return <Construction size={20} />;

    case "incident":
      return <AlertTriangle size={20} />;

    default:
      return <Activity size={20} />;
  }
}

function EventsPage() {
  const totalEvents = eventFeed.length;

  const highEvents = eventFeed.filter(
    (event) => event.severity === "high"
  ).length;

  const mediumEvents = eventFeed.filter(
    (event) => event.severity === "medium"
  ).length;

  const lowEvents = eventFeed.filter(
    (event) => event.severity === "low"
  ).length;

  const locations = {};

  eventFeed.forEach((event) => {
    locations[event.location] =
      (locations[event.location] || 0) + 1;
  });

  const activeLocations = Object.entries(locations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <Topbar />

        <div className="events-page">

          {/* PAGE HEADER */}
          <div className="events-page-header">
            <div>
              <h1>City Events</h1>

              <p>
                Monitor and analyze the latest civic events
                across Jaipur.
              </p>
            </div>

            <div className="events-live-status">
              Live monitoring
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
              <div className="event-summary-icon">
                <ShieldAlert size={24} />
              </div>

              <div className="event-summary-content">
                <span>High Priority</span>
                <strong>{highEvents}</strong>
                <small>Requires attention</small>
              </div>
            </div>

            <div className="event-summary-card">
              <div className="event-summary-icon">
                <TrendingUp size={24} />
              </div>

              <div className="event-summary-content">
                <span>Active Locations</span>
                <strong>{Object.keys(locations).length}</strong>
                <small>Across Jaipur</small>
              </div>
            </div>

          </div>

          {/* TOOLBAR */}
          <div className="events-toolbar">

            <div className="event-filter-group">

              <button className="event-filter-button active">
                All
              </button>

              <button className="event-filter-button">
                <CloudRain size={14} />
                Weather
              </button>

              <button className="event-filter-button">
                <CarFront size={14} />
                Traffic
              </button>

              <button className="event-filter-button">
                <Construction size={14} />
                Roads
              </button>

              <button className="event-filter-button">
                <AlertTriangle size={14} />
                Incidents
              </button>

            </div>

            <span className="events-count">
              Showing {totalEvents} recent events
            </span>

          </div>

          {/* CONTENT */}
          <div className="events-content">

            {/* EVENT LIST */}
            <div className="events-list-card">

              <div className="events-list-header">
                <div>
                  <h2>Recent Events</h2>
                </div>

                <span>
                  Updated just now
                </span>
              </div>

              <div className="events-list">

                {eventFeed.map((event) => (
                  <div
                    className={`event-row ${event.severity}`}
                    key={event.id}
                  >

                    <div className="event-row-icon">
                      {getEventIcon(event.type)}
                    </div>

                    <div className="event-row-info">

                      <div className="event-row-title">
                        {event.title}
                      </div>

                      <div className="event-row-location">
                        <MapPin size={11} />
                        {event.location}, Jaipur
                      </div>

                      <div className="event-row-description">
                        Civic monitoring system detected
                        this event.
                      </div>

                    </div>

                    <div className="event-row-value">
                      {event.value}
                    </div>

                    <div
                      className={`event-severity ${event.severity}`}
                    >
                      {event.severity === "high"
                        ? "HIGH"
                        : event.severity === "medium"
                        ? "MEDIUM"
                        : "LOW"}
                    </div>

                    <div className="event-row-time">
                      <Clock3 size={11} />
                      <br />
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
                  <ShieldAlert size={18} />
                </div>

                <div className="severity-breakdown">

                  <div className="severity-item">
                    <div className="severity-item-header">
                      <span>High Priority</span>
                      <strong>{highEvents}</strong>
                    </div>

                    <div className="severity-bar">
                      <div className="severity-bar-fill high"></div>
                    </div>
                  </div>

                  <div className="severity-item">
                    <div className="severity-item-header">
                      <span>Medium Priority</span>
                      <strong>{mediumEvents}</strong>
                    </div>

                    <div className="severity-bar">
                      <div className="severity-bar-fill medium"></div>
                    </div>
                  </div>

                  <div className="severity-item">
                    <div className="severity-item-header">
                      <span>Low Priority</span>
                      <strong>{lowEvents}</strong>
                    </div>

                    <div className="severity-bar">
                      <div className="severity-bar-fill low"></div>
                    </div>
                  </div>

                </div>

                {/* LOCATIONS */}
                <div className="active-locations">

                  <h3>Most Active Locations</h3>

                  {activeLocations.map(
                    ([location, count], index) => (
                      <div
                        className="location-item"
                        key={location}
                      >

                        <div className="location-rank">
                          {index + 1}
                        </div>

                        <div className="location-info">
                          <strong>{location}</strong>
                          <span>
                            Jaipur civic zone
                          </span>
                        </div>

                        <div className="location-count">
                          {count}
                        </div>

                      </div>
                    )
                  )}

                </div>

              </div>

              {/* DETAIL */}
              <div className="event-detail-card">

                <h3>
                  Event Monitoring
                </h3>

                <div className="event-detail-status">
                  <span>●</span>
                  Monitoring Active
                </div>

                <p className="event-detail-text">
                  CityPulse continuously combines traffic,
                  rainfall, road and incident signals to
                  identify unusual civic activity.
                </p>

              </div>

            </aside>

          </div>

        </div>
      </main>
    </div>
  );
}

export default EventsPage;