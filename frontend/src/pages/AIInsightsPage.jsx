import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  Sparkles,
  CloudRain,
  CarFront,
  Route,
  TrendingUp,
  Waves,
  Wind,
  TriangleAlert,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiService } from "../services/api";

const defaultInsights = [
  {
    title: "Rainfall → Traffic Correlation",
    description:
      "Heavy rainfall is strongly correlated with increased traffic congestion around central Jaipur and MI Road.",
    confidence: "87%",
    icon: CloudRain,
  },
  {
    title: "Air Quality Baseline Normal",
    description:
      "Particulate index across monitored Jaipur zones is maintaining satisfactory thresholds under 60 AQI.",
    confidence: "92%",
    icon: Wind,
  },
  {
    title: "Drainage Threshold Monitoring",
    description:
      "Continuous telemetry active across Walled City, MI Road, and Sitapura industrial corridors.",
    confidence: "84%",
    icon: Waves,
  },
  {
    title: "Road Network Impact",
    description:
      "Underpass waterlogging sensors are calibrated to trigger proactive traffic diversions upon 15mm precipitation spikes.",
    confidence: "81%",
    icon: Route,
  },
];

function AIInsightsPage() {
  const [insights, setInsights] = useState(defaultInsights);
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    Promise.all([
      apiService.fetchSummary(),
      apiService.fetchCorrelations(),
      apiService.fetchAnomalies(),
    ]).then(([summaryRes, corrRes, anomRes]) => {
      if (summaryRes.success && summaryRes.data) {
        setSummaryData(summaryRes.data);
      }

      const liveList = [];

      // 1. Add Live Correlations
      if (corrRes.success && corrRes.data && corrRes.data.length > 0) {
        corrRes.data.forEach((c) => {
          liveList.push({
            title: c.title,
            description: c.summary,
            confidence: `${Math.round(c.confidence * 100)}%`,
            icon: c.title.includes("Smog") || c.title.includes("Air") ? Wind : Waves,
          });
        });
      }

      // 2. Add Live Anomalies
      if (anomRes.success && anomRes.data && anomRes.data.length > 0) {
        anomRes.data.forEach((a) => {
          liveList.push({
            title: `${a.zone?.name || "Jaipur"}: ${a.metricType.replace(/_/g, " ")}`,
            description: a.message,
            confidence: `${Math.min(98, 75 + Math.round(a.deviationZ * 8))}%`,
            icon: TriangleAlert,
          });
        });
      }

      if (liveList.length > 0) {
        setInsights(liveList);
      }
    });
  }, []);

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <Topbar />

        <div className="inner-page">
          <div className="page-title">
            <span className="eyebrow">INTELLIGENCE CENTER</span>
            <h1>
              AI Insights <Sparkles size={26} color="#2874ef" style={{ display: "inline", verticalAlign: "middle" }} />
            </h1>
            <p>
              {summaryData?.headline || "Automated analysis and cross-feed correlation of multiple civic signals across Jaipur."}
            </p>
          </div>

          <div className="insights-page-grid">
            {insights.map((item, idx) => {
              const Icon = item.icon || Sparkles;

              return (
                <div className="large-insight-card" key={item.title + idx}>
                  <div className="large-insight-icon">
                    <Icon size={24} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <span className="ai-label">AI REASONING ENGINE</span>

                    <h2>{item.title}</h2>

                    <p>{item.description}</p>

                    <div className="confidence-bar">
                      <div>
                        <span>Model Confidence</span>
                        <strong>{item.confidence}</strong>
                      </div>

                      <div className="confidence-track">
                        <span style={{ width: item.confidence }}></span>
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
              <h2>Civic Signal Correlation Engine</h2>
            </div>

            <p>
              CityPulse combines real-time OpenWeather telemetry, municipal sensor reports, particulate air quality metrics, and citizen sentiment to surface causal relationships between changing city conditions and infrastructure resilience in Jaipur.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AIInsightsPage;