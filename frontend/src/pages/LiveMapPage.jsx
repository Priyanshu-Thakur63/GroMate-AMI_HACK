import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LiveMap from "../components/LiveMap";

function LiveMapPage() {
  return (
    <div className="app map-page">

      <Sidebar />

      <main className="main-content">

        <Topbar />

        <div className="map-page-content">

          <div className="map-page-header">

            <div>
              <span className="page-eyebrow">
                REAL-TIME MONITORING
              </span>

              <h1>Live City Map</h1>

              <p>
                Monitor traffic, rainfall, incidents and
                infrastructure risks across Jaipur.
              </p>
            </div>

            <div className="map-live-status">
              <span></span>
              Live monitoring
            </div>

          </div>

          <div className="map-page-container">
            <LiveMap />
          </div>

        </div>

      </main>

    </div>
  );
}

export default LiveMapPage;