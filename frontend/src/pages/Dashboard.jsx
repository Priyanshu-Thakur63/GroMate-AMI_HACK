import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import LiveMap from "../components/LiveMap";
import RecentAlerts from "../components/RecentAlerts";
import TrendChart from "../components/TrendChart";
import AIInsights from "../components/AIInsights";

function Dashboard() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const greeting =
    hours < 12 ? "Good morning" : hours < 17 ? "Good afternoon" : "Good evening";

  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <Topbar />

        <div className="dashboard-content">
          <section className="welcome-section">
            <div>
              <span className="eyebrow">{greeting.toUpperCase()}</span>

              <h1>
                {greeting}, Jaipur <span>👋</span>
              </h1>

              <p>
                Live civic health, weather telemetry, and infrastructure monitoring across Jaipur.
              </p>
            </div>

            <div className="system-area">
              <div className="current-time">
                <span>▣</span>
                {formattedDate}
                <span>◷</span>
                {formattedTime}
              </div>

              <div className="system-status">
                <div className="system-check">✓</div>

                <div>
                  <strong>All systems operational</strong>
                  <p>
                    PostgreSQL database and live OpenWeather stream active.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <StatCard />

          <LiveMap />

          <div className="dashboard-bottom">
            <RecentAlerts />
            <TrendChart />
            <AIInsights />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;