import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import LiveMapPage from "./pages/LiveMapPage";
import AIInsightsPage from "./pages/AIInsightsPage";
import EventsPage from "./pages/EventsPage";
import ReportsPage from "./pages/ReportsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route
          path="/live-map"
          element={<LiveMapPage />}
        />

        <Route
          path="/ai-insights"
          element={<AIInsightsPage />}
        />

        <Route
          path="/events"
          element={<EventsPage />}
        />

        <Route
          path="/reports"
          element={<ReportsPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;