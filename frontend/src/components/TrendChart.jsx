import React, { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { hourlyTrend } from "../data/cityData";
import { apiService } from "../services/api";

const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#07172f",
          color: "white",
          padding: "8px 12px",
          borderRadius: "8px",
          fontSize: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <strong style={{ display: "block", marginBottom: "4px" }}>{label}</strong>
        <div style={{ color: "#38bdf8", marginBottom: "2px" }}>
          🔵 Traffic Index: <strong>{payload[0]?.value}</strong>
        </div>
        <div style={{ color: "#c084fc" }}>
          🟣 Rainfall: <strong>{payload[1]?.value} mm</strong>
        </div>
      </div>
    );
  }
  return null;
};

function TrendChart() {
  const [period, setPeriod] = useState("24H");
  const [chartData, setChartData] = useState(hourlyTrend);

  useEffect(() => {
    apiService.fetchLivePulse().then((res) => {
      if (res.success && res.data) {
        const avg = res.data.cityAvgScore || 84;
        
        if (period === "24H") {
          setChartData([
            { time: "00:00", traffic: Math.min(100, avg - 15), rainfall: 0 },
            { time: "04:00", traffic: Math.min(100, avg - 25), rainfall: 0 },
            { time: "08:00", traffic: Math.min(100, avg + 8), rainfall: 0 },
            { time: "12:00", traffic: Math.min(100, avg + 12), rainfall: 2 },
            { time: "16:00", traffic: Math.min(100, avg + 5), rainfall: 0 },
            { time: "20:00", traffic: avg, rainfall: 0 },
            { time: "Now", traffic: avg, rainfall: 0 },
          ]);
        } else if (period === "7D") {
          setChartData([
            { time: "Mon", traffic: 72, rainfall: 4 },
            { time: "Tue", traffic: 78, rainfall: 12 },
            { time: "Wed", traffic: 84, rainfall: 0 },
            { time: "Thu", traffic: 80, rainfall: 8 },
            { time: "Fri", traffic: 88, rainfall: 0 },
            { time: "Sat", traffic: 76, rainfall: 0 },
            { time: "Sun", traffic: avg, rainfall: 0 },
          ]);
        } else {
          setChartData([
            { time: "W1", traffic: 75, rainfall: 24 },
            { time: "W2", traffic: 82, rainfall: 45 },
            { time: "W3", traffic: 79, rainfall: 15 },
            { time: "W4", traffic: avg, rainfall: 6 },
          ]);
        }
      }
    });
  }, [period]);

  return (
    <section className="panel-card trend-card">
      <div className="panel-heading">
        <div>
          <h3>
            <BarChart3 size={18} />
            Traffic & Rainfall Trends
          </h3>
          <p>Multi-source civic telemetry</p>
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

      <div style={{ width: "100%", height: 210, marginTop: "6px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#8092ad"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              stroke="#8092ad"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <Tooltip content={<CustomChartTooltip />} />
            <Line
              type="monotone"
              dataKey="traffic"
              stroke="#2874ef"
              strokeWidth={3}
              dot={{ r: 3, fill: "#2874ef" }}
              activeDot={{ r: 5 }}
            />
            <Bar
              dataKey="rainfall"
              fill="#8b5cf6"
              barSize={14}
              radius={[3, 3, 0, 0]}
              opacity={0.85}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default TrendChart;