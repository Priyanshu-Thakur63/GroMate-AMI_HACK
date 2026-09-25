import {
  Search,
  MapPin,
  ChevronDown,
  Bell,
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiService } from "../services/api";

function Topbar() {
  const [incidentCount, setIncidentCount] = useState(3);

  useEffect(() => {
    apiService.fetchIncidents().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setIncidentCount(res.data.length);
      }
    });
  }, []);

  return (
    <header className="topbar">
      {/* SEARCH */}
      <div className="search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search locations, incidents, roads..."
        />
      </div>

      {/* RIGHT SIDE ACTIONS */}
      <div className="topbar-actions">
        <button className="location-button">
          <MapPin size={16} color="#2874ef" />
          <span>Jaipur</span>
          <ChevronDown size={14} />
        </button>

        <div className="live-status">
          <span></span>
          LIVE
        </div>

        <button className="notification-button" title="Active Alerts">
          <Bell size={19} />
          <b>{incidentCount}</b>
        </button>

        <div className="profile">CP</div>
      </div>
    </header>
  );
}

export default Topbar;