import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import LiveMap from "../components/LiveMap";
import RecentAlerts from "../components/RecentAlerts";
import TrendChart from "../components/TrendChart";
import AIInsights from "../components/AIInsights";

function Dashboard() {
  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <Topbar />

        <div className="dashboard-content">
          <section className="welcome-section">
            <div>
              <span className="eyebrow">GOOD EVENING</span>

              <h1>
                Good evening, Jaipur <span>👋</span>
              </h1>

              <p>
                Here's what's happening across the city right now.
              </p>
            </div>

            <div className="system-area">
              <div className="current-time">
                <span>▣</span>
                Thursday, 24 September 2026
                <span>◷</span>
                4:43:21 PM
              </div>

              <div className="system-status">
                <div className="system-check">✓</div>

                <div>
                  <strong>All systems operational</strong>
                  <p>
                    City infrastructure and monitoring systems are online.
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