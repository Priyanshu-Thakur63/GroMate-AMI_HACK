import { useState } from "react";
import {
  BarChart3,
  ChevronDown,
} from "lucide-react";
import { hourlyTrend } from "../data/cityData";

function TrendChart() {
  const [period, setPeriod] = useState("24H");

  const maxRain = 40;

  return (
    <section className="panel-card trend-card">
      <div className="panel-heading">
        <div>
          <h3>
            <BarChart3 size={18} />
            Traffic & Rainfall Trends
          </h3>

          <p>Last 7 hours</p>
        </div>

        <div className="period-buttons">
          {["24H", "7D", "30D"].map((item) => (
            <button
              key={item}
              className={period === item ? "active" : ""}
              onClick={() => setPeriod(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-legend">
        <span>
          <i className="blue-line"></i>
          Traffic Index
        </span>

        <span>
          <i className="purple-bar"></i>
          Rainfall (mm)
        </span>
      </div>

      <div className="chart">
        <div className="chart-y-axis">
          <span>100</span>
          <span>80</span>
          <span>60</span>
          <span>40</span>
          <span>20</span>
          <span>0</span>
        </div>

        <div className="chart-area">
          <div className="chart-grid-lines">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </div>

          <svg
            className="traffic-line"
            viewBox="0 0 800 220"
            preserveAspectRatio="none"
          >
            <polyline
              points="0,110 100,105 200,112 300,75 400,55 500,80 600,62 700,105 800,135"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
          </svg>

          <div className="rain-bars">
            {hourlyTrend.map((item) => (
              <div className="bar-column" key={item.time}>
                <div
                  className="rain-bar"
                  style={{
                    height: `${(item.rainfall / maxRain) * 100}%`,
                  }}
                ></div>

                <span>{item.time}</span>
              </div>
            ))}
          </div>

          <div className="chart-tooltip">
            <strong>3:00 PM</strong>
            <span>🔵 Traffic: 72</span>
            <span>🟣 Rainfall: 18 mm</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrendChart;