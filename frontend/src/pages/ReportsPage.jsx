import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  TrendingUp,
  CloudRain,
  CarFront,
  TriangleAlert,
  Wind,
} from "lucide-react";
import { apiService } from "../services/api";

function ReportsPage() {
  const [pulseData, setPulseData] = useState(null);
  const [reportData, setReportData] = useState({
    traffic: "84",
    rainfall: "0.0 mm",
    alerts: "02",
    risk: "84",
    aqi: "34 AQI",
  });

  useEffect(() => {
    Promise.all([
      apiService.fetchLivePulse(),
      apiService.fetchWeather(),
      apiService.fetchIncidents(),
    ]).then(([pulseRes, weatherRes, incRes]) => {
      if (pulseRes.success && pulseRes.data) {
        setPulseData(pulseRes.data);
        const avgScore = pulseRes.data.cityAvgScore || 84;
        const openIncs = incRes.data?.filter((i) => i.status !== "RESOLVED") || [];
        const weatherList = weatherRes.data || [];
        const maxRain = weatherList.reduce((max, z) => {
          const rain = z.latestWeather?.precipitation || 0;
          return rain > max ? rain : max;
        }, 0);

        setReportData({
          traffic: `${avgScore}`,
          rainfall: `${maxRain.toFixed(1)} mm`,
          alerts: `0${openIncs.length}`.slice(-2),
          risk: `${avgScore}`,
          aqi: "34 AQI",
        });
      }
    });
  }, []);

  const handleDownload = () => {
    const report = {
      city: "Jaipur, Rajasthan, India",
      generatedAt: new Date().toISOString(),
      liveTelemetry: {
        summary: reportData,
        cityPulse: pulseData,
      },
      status: "All systems operational",
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Jaipur_CityPulse_Report_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <Topbar />

        <div className="inner-page">
          <div className="page-title reports-title">
            <div>
              <span className="page-eyebrow">CITY ANALYTICS</span>
              <h1>Municipal Reports</h1>
              <p>Civic intelligence summaries and city performance telemetry across Jaipur.</p>
            </div>

            <button className="download-button" onClick={handleDownload}>
              <Download size={17} />
              Export Live Report (.JSON)
            </button>
          </div>

          <div className="report-grid">
            <div className="report-card">
              <div className="stat-icon blue" style={{ marginBottom: "8px" }}>
                <CarFront size={22} />
              </div>
              <span>Average Traffic Index</span>
              <strong>{reportData.traffic}</strong>
              <small>Live municipal index</small>
            </div>

            <div className="report-card">
              <div className="stat-icon blue" style={{ marginBottom: "8px" }}>
                <CloudRain size={22} />
              </div>
              <span>Precipitation</span>
              <strong>{reportData.rainfall}</strong>
              <small>OpenWeather sensor feed</small>
            </div>

            <div className="report-card">
              <div className="stat-icon red" style={{ marginBottom: "8px" }}>
                <TriangleAlert size={22} />
              </div>
              <span>Active Incidents</span>
              <strong>{reportData.alerts}</strong>
              <small>Open reports in Jaipur</small>
            </div>

            <div className="report-card">
              <div className="stat-icon green" style={{ marginBottom: "8px" }}>
                <TrendingUp size={22} />
              </div>
              <span>City Health Score</span>
              <strong>{reportData.risk} / 100</strong>
              <small>Optimal resilience index</small>
            </div>
          </div>

          <div className="report-main-card">
            <div>
              <FileText size={24} />
              <h2>Daily City Intelligence Report</h2>
            </div>

            <p>
              Real-time telemetry across monitored municipal zones (Walled City, C-Scheme & MI Road, Malviya Nagar, Mansarovar, Vaishali Nagar, and Sitapura RIICO) is active. Multi-source normalization, anomaly detection, and correlation engines are operating continuously.
            </p>

            <div className="report-sections">
              <div>
                <strong>Traffic Index</strong>
                <span>{reportData.traffic}</span>
              </div>

              <div>
                <strong>Rainfall</strong>
                <span>{reportData.rainfall}</span>
              </div>

              <div>
                <strong>Active Alerts</strong>
                <span>{reportData.alerts}</span>
              </div>

              <div>
                <strong>Civic Health</strong>
                <span>{reportData.risk} / 100</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ReportsPage;