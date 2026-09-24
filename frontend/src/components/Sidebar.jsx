import {
  Gauge,
  Map,
  Lightbulb,
  TriangleAlert,
  FileText,
  CloudRain,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navigation = [
  { name: "Dashboard", icon: Gauge, path: "/" },
  { name: "Live Map", icon: Map, path: "/live-map" },
  { name: "AI Insights", icon: Lightbulb, path: "/ai-insights" },
  { name: "Events", icon: TriangleAlert, path: "/events" },
  { name: "Reports", icon: FileText, path: "/reports" },
];

function Sidebar() {
  return (
    <aside className="sidebar">

      {/* BRAND */}
      <div className="brand">
        <div className="brand-logo">
          <span>〽</span>
        </div>

        <div>
          <h2>CityPulse</h2>
          <p>Civic Intelligence</p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="sidebar-nav">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* CITY OVERVIEW */}
      <div className="city-overview">

        <h3>City Overview</h3>

        <div className="city-score">
          <div className="score-circle">
            <div className="score-inner">
              <strong>78</strong>
              <span>/100</span>
            </div>
          </div>
        </div>

        <div className="overview-row">
          <span>
            <i className="status-dot green"></i>
            Normal
          </span>

          <strong>68%</strong>
        </div>

        <div className="overview-row">
          <span>
            <i className="status-dot yellow"></i>
            Elevated
          </span>

          <strong>24%</strong>
        </div>

        <div className="overview-row">
          <span>
            <i className="status-dot red"></i>
            Critical
          </span>

          <strong>8%</strong>
        </div>

      </div>

      {/* WEATHER */}
      <div className="sidebar-weather">

        <div className="weather-icon">
          <CloudRain size={30} />
        </div>

        <div className="weather-main">
          <strong>26°C</strong>
          <span>Light Rain</span>
        </div>

        <div className="weather-location">
          Jaipur, Rajasthan
        </div>

        <small>
          Updated 4:43 PM
        </small>

      </div>

    </aside>
  );
}

export default Sidebar;