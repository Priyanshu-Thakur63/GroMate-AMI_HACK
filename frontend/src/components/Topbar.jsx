import {
  Search,
  MapPin,
  ChevronDown,
  Bell,
} from "lucide-react";

function Topbar() {
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


      {/* RIGHT SIDE */}

      <div className="topbar-actions">

        <button className="location-button">

          <MapPin size={17} />

          <span>Jaipur</span>

          <ChevronDown size={15} />

        </button>


        <div className="live-status">

          <span></span>

          LIVE

        </div>


        <button className="notification-button">

          <Bell size={20} />

          <b>3</b>

        </button>


        <div className="profile">

          CP

        </div>

        <ChevronDown size={15} />

      </div>

    </header>
  );
}

export default Topbar;