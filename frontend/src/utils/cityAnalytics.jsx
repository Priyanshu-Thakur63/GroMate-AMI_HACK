export function calculateRisk(data) {
  if (!data) return 0;

  const trafficScore = Math.min(
    data.traffic.index,
    100
  );

  const rainfallScore = Math.min(
    data.rainfall.current * 4,
    100
  );

  const incidentScore = Math.min(
    data.incidents.count * 20,
    100
  );

  const roadScore = Math.min(
    data.roads.blocked * 20,
    100
  );

  const score = Math.round(
    trafficScore * 0.4 +
      rainfallScore * 0.25 +
      incidentScore * 0.2 +
      roadScore * 0.15
  );

  return Math.min(score, 100);
}


export function getRiskLevel(score) {
  if (score >= 80) {
    return "Critical";
  }

  if (score >= 65) {
    return "High";
  }

  if (score >= 45) {
    return "Moderate";
  }

  return "Low";
}


export function analyzeLocation(data) {
  if (!data) {
    return {
      score: 0,
      level: "Low",
      insights: [],
    };
  }

  const score = calculateRisk(data);

  const level = getRiskLevel(score);

  const insights = [];

  if (data.rainfall.change >= 50) {
    insights.push({
      type: "rainfall",
      title: "Rainfall spike detected",
      description:
        `Rainfall increased by ${data.rainfall.change}% compared with the previous period.`,
    });
  }

  if (data.traffic.change >= 20) {
    insights.push({
      type: "traffic",
      title: "Traffic congestion increasing",
      description:
        `Traffic increased by ${data.traffic.change}% in this area.`,
    });
  }

  if (
    data.rainfall.change >= 50 &&
    data.traffic.change >= 20
  ) {
    insights.push({
      type: "correlation",
      title: "Rainfall → Traffic correlation",
      description:
        "Heavy rainfall is occurring alongside increased traffic congestion.",
    });
  }

  if (data.roads.blocked > 0) {
    insights.push({
      type: "road",
      title: "Road access affected",
      description:
        `${data.roads.blocked} road segment(s) are currently blocked or affected.`,
    });
  }

  return {
    location: data.location,
    score,
    level,
    insights,
  };
}


export function getCityAnalytics(cityData) {
  if (!cityData?.length) {
    return {
      averageRisk: 0,
      highRiskZones: 0,
      totalBlockedRoads: 0,
      rainfallAverage: 0,
      trafficAverage: 0,
    };
  }

  const totalRisk = cityData.reduce(
    (sum, item) =>
      sum + calculateRisk(item),
    0
  );

  const totalTraffic = cityData.reduce(
    (sum, item) =>
      sum + item.traffic.index,
    0
  );

  const totalRainfall = cityData.reduce(
    (sum, item) =>
      sum + item.rainfall.current,
    0
  );

  const totalBlockedRoads =
    cityData.reduce(
      (sum, item) =>
        sum + item.roads.blocked,
      0
    );

  const highRiskZones =
    cityData.filter(
      (item) =>
        calculateRisk(item) >= 65
    ).length;

  return {
    averageRisk: Math.round(
      totalRisk / cityData.length
    ),

    highRiskZones,

    totalBlockedRoads,

    rainfallAverage:
      Math.round(
        (totalRainfall /
          cityData.length) *
          10
      ) / 10,

    trafficAverage:
      Math.round(
        totalTraffic /
          cityData.length
      ),
  };
}