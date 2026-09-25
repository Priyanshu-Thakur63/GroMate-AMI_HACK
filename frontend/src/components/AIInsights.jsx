import {
  Sparkles,
  CloudRain,
  Waves,
  CheckCircle2,
  Wind,
  TriangleAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiService } from "../services/api";

const defaultInsights = [
  {
    title: "Rainfall → Traffic Correlation",
    text: "Heavy rainfall is strongly correlated with increased traffic congestion across central Jaipur.",
    confidence: "87%",
    type: "blue",
    icon: CloudRain,
  },
  {
    title: "Air Quality Baseline Normal",
    text: "Particulate index across monitored Jaipur zones is maintaining satisfactory thresholds under 60 AQI.",
    confidence: "92%",
    type: "green",
    icon: Wind,
  },
  {
    title: "Drainage Threshold Active",
    text: "Continuous telemetry active across Walled City, MI Road, and Sitapura industrial corridors.",
    confidence: "84%",
    type: "orange",
    icon: Waves,
  },
];

function AIInsights() {
  const [insights, setInsights] = useState(defaultInsights);

  useEffect(() => {
    Promise.all([
      apiService.fetchSummary(),
      apiService.fetchCorrelations(),
      apiService.fetchAnomalies(),
    ]).then(([summaryRes, corrRes, anomRes]) => {
      const liveList = [];

      // 1. Add Live Correlations
      if (corrRes.success && corrRes.data && corrRes.data.length > 0) {
        corrRes.data.forEach((c) => {
          liveList.push({
            title: c.title,
            text: c.summary,
            confidence: `${Math.round(c.confidence * 100)}%`,
            type: c.confidence > 0.85 ? "orange" : "blue",
            icon: c.title.includes("Smog") || c.title.includes("Air") ? Wind : Waves,
          });
        });
      }

      // 2. Add Live Anomalies
      if (anomRes.success && anomRes.data && anomRes.data.length > 0) {
        anomRes.data.forEach((a) => {
          liveList.push({
            title: `${a.zone?.name || "Jaipur"}: ${a.metricType.replace(/_/g, " ")}`,
            text: a.message,
            confidence: `${Math.min(98, 75 + Math.round(a.deviationZ * 8))}%`,
            type: a.severity === "CRITICAL" ? "orange" : "blue",
            icon: TriangleAlert,
          });
        });
      }

      // 3. Add High-Level Summary Insight
      if (summaryRes.success && summaryRes.data?.keyInsights?.length > 0) {
        liveList.push({
          title: "Civic Health Assessment",
          text: summaryRes.data.keyInsights[0],
          confidence: "90%",
          type: summaryRes.data.status === "NORMAL" ? "green" : "orange",
          icon: summaryRes.data.status === "NORMAL" ? CheckCircle2 : Sparkles,
        });
      }

      if (liveList.length > 0) {
        setInsights(liveList.slice(0, 3));
      }
    });
  }, []);

  return (
    <section className="panel-card insights-card">
      <div className="panel-heading">
        <div>
          <h3>
            <Sparkles size={18} />
            AI Insights
          </h3>
          <p>Automated civic intelligence</p>
        </div>

        <Link to="/ai-insights" style={{ textDecoration: "none" }}>
          <button>View all →</button>
        </Link>
      </div>

      <div className="insights-list">
        {insights.map((item, idx) => {
          const Icon = item.icon || Sparkles;

          return (
            <div className={`insight-item ${item.type}`} key={item.title + idx}>
              <div className="insight-icon">
                <Icon size={19} />
              </div>

              <div className="insight-text">
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </div>

              <span className="confidence">
                {item.confidence} confidence
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default AIInsights;