import {
  Sparkles,
  CloudRain,
  Waves,
  CheckCircle2,
} from "lucide-react";

const insights = [
  {
    title: "Rainfall → Traffic Correlation",
    text: "Heavy rainfall is strongly correlated with increased traffic congestion across central Jaipur.",
    confidence: "87%",
    type: "blue",
    icon: CloudRain,
  },
  {
    title: "Flood Risk Alert",
    text: "Waterlogging risk is elevated in 3 zones based on current rainfall and drainage capacity.",
    confidence: "78%",
    type: "orange",
    icon: Waves,
  },
  {
    title: "Improved Conditions",
    text: "Road conditions have improved in C-Scheme with traffic returning to normal levels.",
    confidence: "72%",
    type: "green",
    icon: CheckCircle2,
  },
];

function AIInsights() {
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

        <button>View all →</button>
      </div>

      <div className="insights-list">
        {insights.map((item) => {
          const Icon = item.icon;

          return (
            <div className={`insight-item ${item.type}`} key={item.title}>
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