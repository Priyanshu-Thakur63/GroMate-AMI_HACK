import {
  Gauge,
  Map,
  Lightbulb,
  TriangleAlert,
  FileText,
  CloudRain,
  Sun,
  CloudLightning,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiService } from "../services/api";

const navigation = [
  { name: "Dashboard", icon: Gauge, path: "/" },
  { name: "Live Map", icon: Map, path: "/live-map" },
  { name: "AI Insights", icon: Lightbulb, path: "/ai-insights" },
  { name: "Events", icon: TriangleAlert, path: "/events" },
  { name: "Reports", icon: FileText, path: "/reports" },
];

function Sidebar() {
  const [livePulse, setLivePulse] = useState(null);
  const [liveWeather, setLiveWeather] = useState(null);

  useEffect(() => {
    apiService.fetchLivePulse().then((res) => {
      if (res.success && res.data) setLivePulse(res.data);
    });
    apiService.fetchWeather().then((res) => {
      if (res.success && res.data && res.data[0]?.latestWeather) {
        setLiveWeather(res.data[0].latestWeather);
      }
    });
  }, []);

  const score = livePulse ? livePulse.cityAvgScore : 84;
  const zones = livePulse?.zonePulses || [];
  const total = zones.length || 6;
  const normalCount = zones.filter((z) => z.overallScore >= 70).length || (total > 0 ? total - 1 : 4);
  const elevatedCount = zones.filter((z) => z.overallScore >= 50 && z.overallScore < 70).length || 1;
  const criticalCount = zones.filter((z) => z.overallScore < 50).length || 0;

  const normalPct = Math.round((normalCount / total) * 100);
  const elevatedPct = Math.round((elevatedCount / total) * 100);
  const criticalPct = Math.max(0, 100 - normalPct - elevatedPct);

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
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* CITY OVERVIEW GAUGE */}
      <div className="city-overview">
        <h3>City Overview</h3>

        <div className="city-score">
          <div className="score-circle">
            <div className="score-inner">
              <strong>{score}</strong>
              <span>/100</span>
            </div>
          </div>
        </div>

        <div className="overview-row">
          <span>
            <i className="status-dot green"></i>
            Normal
          </span>
          <strong>{normalPct}%</strong>
        </div>

        <div className="overview-row">
          <span>
            <i className="status-dot yellow"></i>
            Elevated
          </span>
          <strong>{elevatedPct}%</strong>
        </div>

        <div className="overview-row">
          <span>
            <i className="status-dot red"></i>
            Critical
          </span>
          <strong>{criticalPct}%</strong>
        </div>
      </div>

      {/* WEATHER WIDGET */}
      <div className="sidebar-weather">
        <div className="weather-icon">
          {liveWeather?.precipitation > 0 ? (
            <CloudRain size={26} color="#60a5fa" />
          ) : liveWeather?.condition?.includes('Thunder') ? (
            <CloudLightning size={26} color="#f59e0b" />
          ) : (
            <Sun size={26} color="#fbbf24" />
          )}
        </div>

        <div className="weather-main">
          <strong>{liveWeather ? `${Math.round(liveWeather.temperature)}°C` : "24°C"}</strong>
          <span>{liveWeather ? liveWeather.condition : "Clear Sky"}</span>
        </div>

        <div className="weather-location">Jaipur, Rajasthan</div>

        <small>Live OpenWeather Feed</small>
      </div>
    </aside>
  );
}

export default Sidebar;