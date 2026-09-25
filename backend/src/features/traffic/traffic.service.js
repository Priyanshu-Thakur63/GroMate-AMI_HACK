const prisma = require('../../config/database');

class TrafficService {
  /**
   * Retrieves real-time traffic speeds, congestion levels, delay estimates,
   * and arterial incident linkages for Jaipur municipal transit corridors.
   */
  async getLiveTrafficData() {
    const zones = await prisma.zone.findMany({
      include: {
        incidentReports: {
          where: { status: { not: 'RESOLVED' } },
        },
        weatherData: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
    });

    const corridors = [
      {
        id: "tonk-road",
        name: "Tonk Road Arterial",
        zoneCode: "JPR-ST-06",
        freeFlowSpeed: 50,
        lengthKm: 14.2,
        coordinates: [
          [26.9175, 75.815],
          [26.892, 75.808],
          [26.865, 75.804],
          [26.8467, 75.8056],
          [26.818, 75.809],
        ],
      },
      {
        id: "mi-road",
        name: "MI Road Commercial Belt",
        zoneCode: "JPR-CS-02",
        freeFlowSpeed: 35,
        lengthKm: 4.8,
        coordinates: [
          [26.9215, 75.827],
          [26.919, 75.818],
          [26.9157, 75.801],
          [26.918, 75.789],
          [26.92, 75.778],
        ],
      },
      {
        id: "jln-marg",
        name: "JLN Marg Medical & Institutional Axis",
        zoneCode: "JPR-MN-03",
        freeFlowSpeed: 60,
        lengthKm: 9.5,
        coordinates: [
          [26.897, 75.815],
          [26.878, 75.812],
          [26.853, 75.807],
          [26.836, 75.806],
          [26.812, 75.802],
        ],
      },
      {
        id: "ajmer-road",
        name: "Ajmer Road Expressway Link",
        zoneCode: "JPR-VN-05",
        freeFlowSpeed: 55,
        lengthKm: 11.0,
        coordinates: [
          [26.912, 75.772],
          [26.896, 75.748],
          [26.882, 75.728],
          [26.865, 75.705],
        ],
      },
      {
        id: "gopalpura-mansarovar",
        name: "Gopalpura - Mansarovar Corridor",
        zoneCode: "JPR-MS-04",
        freeFlowSpeed: 45,
        lengthKm: 7.6,
        coordinates: [
          [26.8506, 75.764],
          [26.858, 75.783],
          [26.853, 75.807],
          [26.855, 75.825],
        ],
      },
      {
        id: "walled-city-loop",
        name: "Walled City Heritage Circuit",
        zoneCode: "JPR-WC-01",
        freeFlowSpeed: 25,
        lengthKm: 3.2,
        coordinates: [
          [26.924, 75.826],
          [26.926, 75.832],
          [26.9245, 75.839],
          [26.919, 75.837],
          [26.9175, 75.829],
          [26.924, 75.826],
        ],
      },
    ];

    const corridorTelemetries = corridors.map((corridor) => {
      const zone = zones.find((z) => z.code === corridor.zoneCode) || zones[0];
      const activeIncidents = zone ? zone.incidentReports : [];
      const weather = zone?.weatherData[0] || {};
      const rain = weather.precipitation || 0;

      // Calculate realistic speed reduction based on incidents & rain
      let speedPenalty = 0;
      activeIncidents.forEach((inc) => {
        if (inc.category === 'TRAFFIC_JAM') speedPenalty += 18;
        else if (inc.category === 'WATERLOGGING') speedPenalty += 14;
        else if (inc.severity === 'CRITICAL') speedPenalty += 20;
        else speedPenalty += 8;
      });

      if (rain > 10) speedPenalty += 12;
      else if (rain > 0) speedPenalty += 5;

      const currentSpeed = Math.max(8, Math.round(corridor.freeFlowSpeed - speedPenalty));
      const congestionRatio = 1 - currentSpeed / corridor.freeFlowSpeed;
      const congestionPercent = Math.min(100, Math.max(5, Math.round(congestionRatio * 100)));

      let level = "Fluid";
      let statusColor = "#10b981";
      if (congestionPercent > 65) {
        level = "Heavy Congestion";
        statusColor = "#ef4444";
      } else if (congestionPercent > 35) {
        level = "Moderate Traffic";
        statusColor = "#f59e0b";
      }

      const freeFlowTravelMin = (corridor.lengthKm / corridor.freeFlowSpeed) * 60;
      const currentTravelMin = (corridor.lengthKm / currentSpeed) * 60;
      const delayMin = Math.max(0, Math.round(currentTravelMin - freeFlowTravelMin));

      return {
        id: corridor.id,
        name: corridor.name,
        zoneCode: corridor.zoneCode,
        zoneName: zone ? zone.name : "Jaipur Central",
        coordinates: corridor.coordinates,
        currentSpeed,
        freeFlowSpeed: corridor.freeFlowSpeed,
        lengthKm: corridor.lengthKm,
        congestionPercent,
        delayMin,
        level,
        statusColor,
        activeIncidentsCount: activeIncidents.length,
        incidentSummaries: activeIncidents.map((i) => i.title),
        recommendation:
          congestionPercent > 60
            ? `Severe bottleneck detected near ${corridor.name}. Recommend diverting via secondary arterial routes.`
            : `Traffic moving steadily at ${currentSpeed} km/h.`,
      };
    });

    const cityAvgSpeed = Math.round(
      corridorTelemetries.reduce((acc, c) => acc + c.currentSpeed, 0) / corridorTelemetries.length
    );
    const cityCongestionIndex = Math.round(
      corridorTelemetries.reduce((acc, c) => acc + c.congestionPercent, 0) / corridorTelemetries.length
    );

    return {
      success: true,
      data: {
        cityAvgSpeed,
        cityCongestionIndex,
        totalCorridorsMonitored: corridorTelemetries.length,
        corridors: corridorTelemetries,
        generatedAt: new Date().toISOString(),
      },
    };
  }
}

module.exports = new TrafficService();
