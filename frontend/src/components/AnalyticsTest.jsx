import { cityData } from "../data/cityData";

import {
  analyzeLocation,
} from "../utils/cityAnalytics";


function AnalyticsTest() {

  const tonkRoad = cityData[0];

  const analysis =
    analyzeLocation(tonkRoad);


  return (
    <div
      style={{
        background: "#ffffff",
        padding: "25px",
        borderRadius: "15px",
        marginTop: "20px",
      }}
    >

      <h2>
        CityPulse Intelligence Test
      </h2>

      <p>
        Location:{" "}
        <strong>
          {analysis.location}
        </strong>
      </p>


      <p>
        Traffic anomaly:{" "}
        <strong>
          {analysis.traffic.detected
            ? "Detected"
            : "Normal"}
        </strong>
      </p>


      <p>
        Rainfall anomaly:{" "}
        <strong>
          {analysis.rainfall.detected
            ? "Detected"
            : "Normal"}
        </strong>
      </p>


      <p>
        Correlation:{" "}
        <strong>
          {analysis.correlation.strength}
        </strong>
      </p>


      <p>
        Risk Score:{" "}
        <strong>
          {analysis.risk.score}/100
        </strong>
      </p>


      <p>
        Risk Level:{" "}
        <strong>
          {analysis.risk.level}
        </strong>
      </p>


      <p>
        {analysis.correlation.message}
      </p>

    </div>
  );
}


export default AnalyticsTest;