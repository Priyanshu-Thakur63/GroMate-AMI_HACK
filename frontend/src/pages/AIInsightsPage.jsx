import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  Sparkles,
  CloudRain,
  CarFront,
  Route,
  TrendingUp,
} from "lucide-react";

const insights = [
  {
    title: "Rainfall → Traffic Correlation",
    description:
      "Heavy rainfall is strongly correlated with increased traffic congestion around central Jaipur.",
    confidence: "87%",
    icon: CloudRain,
  },
  {
    title: "Flood Risk Alert",
    description:
      "Waterlogging risk is elevated in 3 zones based on current rainfall and drainage capacity.",
    confidence: "78%",
    icon: CloudRain,
  },
  {
    title: "Traffic Pattern Detected",
    description:
      "Traffic congestion on MI Road is 32% above the recent baseline.",
    confidence: "84%",
    icon: CarFront,
  },
  {
    title: "Road Network Impact",
    description:
      "Two road closures are increasing travel pressure on nearby intersections.",
    confidence: "81%",
    icon: Route,
  },
];

function AIInsightsPage() {
  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <Topbar />

        <div className="inner-page">
          <div className="page-title">
            <span className="eyebrow">INTELLIGENCE CENTER</span>
            <h1>
              AI Insights <Sparkles size={28} />
            </h1>
            <p>
              Automated analysis of multiple civic signals.
            </p>
          </div>

          <div className="insights-page-grid">
            {insights.map((item) => {
              const Icon = item.icon;

              return (
                <div className="large-insight-card" key={item.title}>
                  <div className="large-insight-icon">
                    <Icon size={24} />
                  </div>

                  <div>
                    <span className="ai-label">
                      AI ANALYSIS
                    </span>

                    <h2>{item.title}</h2>

                    <p>{item.description}</p>

                    <div className="confidence-bar">
                      <div>
                        <span>Confidence</span>
                        <strong>{item.confidence}</strong>
                      </div>

                      <div className="confidence-track">
                        <span
                          style={{
                            width: item.confidence,
                          }}
                        ></span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="correlation-card">
            <div>
              <TrendingUp size={24} />
              <h2>Civic Signal Correlation</h2>
            </div>

            <p>
              CityPulse combines traffic, rainfall, incidents and
              road conditions to surface relationships between
              changing city conditions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AIInsightsPage;