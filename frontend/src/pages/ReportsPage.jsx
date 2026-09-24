import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  FileText,
  Download,
  TrendingUp,
  CloudRain,
  CarFront,
  TriangleAlert,
} from "lucide-react";

function ReportsPage() {
  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <Topbar />

        <div className="inner-page">
          <div className="page-title reports-title">
            <div>
              <span className="eyebrow">CITY ANALYTICS</span>
              <h1>Reports</h1>
              <p>
                Civic intelligence summaries and city performance.
              </p>
            </div>

            <button className="download-button">
              <Download size={17} />
              Export Report
            </button>
          </div>

          <div className="report-grid">
            <div className="report-card">
              <div className="report-icon blue">
                <CarFront />
              </div>

              <span>Average Traffic Index</span>
              <strong>64</strong>
              <small>↑ 8.4% from baseline</small>
            </div>

            <div className="report-card">
              <div className="report-icon blue">
                <CloudRain />
              </div>

              <span>Total Rainfall</span>
              <strong>18 mm</strong>
              <small>Last 60 minutes</small>
            </div>

            <div className="report-card">
              <div className="report-icon red">
                <TriangleAlert />
              </div>

              <span>Active Incidents</span>
              <strong>07</strong>
              <small>2 high priority</small>
            </div>

            <div className="report-card">
              <div className="report-icon green">
                <TrendingUp />
              </div>

              <span>City Risk Score</span>
              <strong>78</strong>
              <small>Moderate overall risk</small>
            </div>
          </div>

          <div className="report-main-card">
            <div>
              <FileText size={24} />
              <h2>Daily City Intelligence Report</h2>
            </div>

            <p>
              Today's monitoring data indicates increased rainfall
              activity around Tonk Road and Mansarovar, with
              corresponding traffic pressure on major roads.
            </p>

            <div className="report-sections">
              <div>
                <strong>Traffic</strong>
                <span>64 index</span>
              </div>

              <div>
                <strong>Rainfall</strong>
                <span>18 mm</span>
              </div>

              <div>
                <strong>Alerts</strong>
                <span>7 active</span>
              </div>

              <div>
                <strong>Risk</strong>
                <span>78 / 100</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ReportsPage;