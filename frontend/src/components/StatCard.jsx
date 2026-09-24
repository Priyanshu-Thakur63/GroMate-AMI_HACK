import {
  CarFront,
  CloudRain,
  TriangleAlert,
  MapPin,
  TrendingUp,
} from "lucide-react";

const cards = [
  {
    title: "Traffic Index",
    value: "64",
    change: "+8.4%",
    subtitle: "Moderate congestion",
    icon: CarFront,
    type: "blue",
  },
  {
    title: "Rainfall",
    value: "18 mm",
    change: "+12%",
    subtitle: "Last 60 minutes",
    icon: CloudRain,
    type: "blue",
  },
  {
    title: "Active Alerts",
    value: "07",
    change: "+2",
    subtitle: "2 high priority",
    icon: TriangleAlert,
    type: "red",
  },
  {
    title: "Affected Zones",
    value: "12",
    change: "+3",
    subtitle: "Across Jaipur",
    icon: MapPin,
    type: "green",
  },
];

function StatCard() {
  return (
    <div className="stats-grid">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div className="stat-card" key={card.title}>
            <div className={`stat-icon ${card.type}`}>
              <Icon size={22} />
            </div>

            <div className="stat-content">
              <span className="stat-title">{card.title}</span>

              <div className="stat-number-row">
                <strong>{card.value}</strong>

                <span className="stat-change">
                  <TrendingUp size={13} />
                  {card.change}
                </span>
              </div>

              <small>{card.subtitle}</small>
            </div>

            <div className={`mini-bars ${card.type}`}>
              <i></i>
              <i></i>
              <i></i>
              <i></i>
              <i></i>
              <i></i>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatCard;