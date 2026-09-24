import {
  BellRing,
  CloudRain,
  CarFront,
  Route,
} from "lucide-react";

const alerts = [
  {
    title: "Waterlogging detected",
    location: "Tonk Road, Jaipur",
    description: "Heavy rainfall causing water accumulation",
    severity: "High",
    type: "rain",
    time: "5 min ago",
  },
  {
    title: "Traffic congestion increased",
    location: "MI Road, Jaipur",
    description: "Traffic density 48% above normal",
    severity: "Medium",
    type: "traffic",
    time: "12 min ago",
  },
  {
    title: "Road closure",
    location: "Ajmer Road, Jaipur",
    description: "Road segment temporarily closed",
    severity: "High",
    type: "road",
    time: "18 min ago",
  },
  {
    title: "Rainfall warning",
    location: "Mansarovar, Jaipur",
    description: "Heavy rainfall expected in next 1 hour",
    severity: "Medium",
    type: "rain",
    time: "25 min ago",
  },
];

function RecentAlerts() {
  return (
    <section className="panel-card alerts-card">
      <div className="panel-heading">
        <div>
          <h3>
            <BellRing size={18} />
            Recent Alerts
          </h3>

          <p>Latest events across the city</p>
        </div>

        <button>View all →</button>
      </div>

      <div className="alerts-list">
        {alerts.map((alert) => {
          const Icon =
            alert.type === "traffic"
              ? CarFront
              : alert.type === "road"
              ? Route
              : CloudRain;

          return (
            <div
              className={`alert-row ${alert.severity.toLowerCase()}`}
              key={alert.title}
            >
              <div className="alert-icon">
                <Icon size={17} />
              </div>

              <div className="alert-info">
                <div className="alert-title">
                  <strong>{alert.title}</strong>
                  <span>{alert.severity}</span>
                </div>

                <small>{alert.location}</small>
                <p>{alert.description}</p>
              </div>

              <time>{alert.time}</time>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default RecentAlerts;