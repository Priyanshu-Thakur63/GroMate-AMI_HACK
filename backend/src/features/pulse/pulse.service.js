const prisma = require('../../config/database');

class PulseService {
  async calculatePulseForZone(zoneId) {
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId },
      include: {
        weatherData: { orderBy: { recordedAt: 'desc' }, take: 1 },
        airQualityData: { orderBy: { recordedAt: 'desc' }, take: 1 },
        incidentReports: { where: { status: { not: 'RESOLVED' } } },
        socialSentiments: { orderBy: { postedAt: 'desc' }, take: 10 },
        disasters: { where: { status: 'ACTIVE' } },
      },
    });

    if (!zone) {
      throw new Error(`Zone with ID ${zoneId} not found`);
    }

    // 1. Environmental Score (Weather & AQI)
    let environmentalScore = 100;
    const latestWeather = zone.weatherData[0];
    const latestAQI = zone.airQualityData[0];

    if (latestWeather) {
      if (latestWeather.precipitation > 50) environmentalScore -= 30;
      else if (latestWeather.precipitation > 20) environmentalScore -= 15;
      else if (latestWeather.precipitation > 5) environmentalScore -= 5;

      if (latestWeather.windSpeed > 60) environmentalScore -= 20;
      else if (latestWeather.windSpeed > 40) environmentalScore -= 10;

      if (latestWeather.alert) environmentalScore -= 20;
    }

    if (latestAQI) {
      if (latestAQI.aqi > 300) environmentalScore -= 40;
      else if (latestAQI.aqi > 200) environmentalScore -= 25;
      else if (latestAQI.aqi > 150) environmentalScore -= 15;
      else if (latestAQI.aqi > 100) environmentalScore -= 5;
    }
    environmentalScore = Math.max(0, Math.min(100, environmentalScore));

    // 2. Infrastructure Score (Open Incidents)
    let infrastructureScore = 100;
    const openIncidents = zone.incidentReports;
    for (const incident of openIncidents) {
      switch (incident.severity) {
        case 'CRITICAL':
          infrastructureScore -= 25;
          break;
        case 'HIGH':
          infrastructureScore -= 15;
          break;
        case 'MEDIUM':
          infrastructureScore -= 8;
          break;
        case 'LOW':
          infrastructureScore -= 3;
          break;
      }
    }
    infrastructureScore = Math.max(0, Math.min(100, infrastructureScore));

    // 3. Social Sentiment Score
    let sentimentScore = 75;
    const recentSentiments = zone.socialSentiments;
    if (recentSentiments.length > 0) {
      const avgSentiment =
        recentSentiments.reduce((acc, curr) => acc + curr.sentimentScore, 0) /
        recentSentiments.length;
      sentimentScore = Math.round(((avgSentiment + 1) / 2) * 100);
    }

    // 4. Disaster Impact Score
    let disasterImpactScore = 100;
    const activeDisasters = zone.disasters;
    for (const disaster of activeDisasters) {
      if (disaster.severity === 'CRITICAL' || disaster.severity === 'HIGH') {
        disasterImpactScore -= 50;
      } else {
        disasterImpactScore -= 25;
      }
    }
    disasterImpactScore = Math.max(0, Math.min(100, disasterImpactScore));

    // Composite Pulse Score
    const overallScore = Math.round(
      infrastructureScore * 0.35 +
        environmentalScore * 0.25 +
        disasterImpactScore * 0.25 +
        sentimentScore * 0.15
    );

    // Multi-feed Cross Correlation
    const detectedCorrelations = [];

    if (
      latestWeather &&
      latestWeather.precipitation > 20 &&
      openIncidents.some((i) => i.category === 'WATERLOGGING')
    ) {
      detectedCorrelations.push({
        type: 'STORM_DRAINAGE_COLLAPSE',
        severity: 'HIGH',
        message: 'Heavy precipitation correlated with multiple waterlogging and flood reports.',
      });
    }

    if (
      openIncidents.some((i) => i.category === 'POWER_OUTAGE') &&
      openIncidents.some((i) => i.category === 'TRAFFIC_JAM')
    ) {
      detectedCorrelations.push({
        type: 'GRID_TRAFFIC_CASCADE',
        severity: 'MEDIUM',
        message: 'Power grid interruptions coinciding with traffic signal outages & road delays.',
      });
    }

    if (
      latestAQI &&
      latestAQI.aqi > 200 &&
      openIncidents.some((i) => i.category === 'FIRE')
    ) {
      detectedCorrelations.push({
        type: 'FIRE_AQI_HAZARD',
        severity: 'CRITICAL',
        message: 'Active fire incidents contributing to hazardous air quality index spikes.',
      });
    }

    let statusLabel = 'NORMAL';
    if (overallScore < 40) statusLabel = 'CRITICAL';
    else if (overallScore < 70) statusLabel = 'ELEVATED_ALERT';

    let summaryText = `Zone ${zone.name} is operating with a Civic Health Score of ${overallScore}/100 (${statusLabel}). `;
    if (activeDisasters.length > 0) {
      summaryText += `WARNING: Active disaster declaration (${activeDisasters[0].title}). `;
    }
    if (openIncidents.length > 0) {
      summaryText += `${openIncidents.length} active civic incident(s) reported. `;
    } else {
      summaryText += `No active disruptions reported. `;
    }

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      zoneCode: zone.code,
      coordinates: { latitude: zone.latitude, longitude: zone.longitude },
      overallScore,
      statusLabel,
      subScores: {
        environmentalScore,
        infrastructureScore,
        sentimentScore,
        disasterImpactScore,
      },
      feedSnapshots: {
        weather: latestWeather || null,
        airQuality: latestAQI || null,
        activeIncidentCount: openIncidents.length,
        activeDisasters: activeDisasters,
        recentSentimentCount: recentSentiments.length,
      },
      detectedCorrelations,
      summaryText,
      timestamp: new Date().toISOString(),
    };
  }

  async getAllZonesPulse() {
    const zones = await prisma.zone.findMany();
    const zonePulses = await Promise.all(
      zones.map((zone) => this.calculatePulseForZone(zone.id))
    );

    const cityAvgScore =
      zonePulses.length > 0
        ? Math.round(
            zonePulses.reduce((acc, z) => acc + z.overallScore, 0) / zonePulses.length
          )
        : 100;

    return {
      cityAvgScore,
      totalZones: zonePulses.length,
      zonePulses,
      globalSummary: `City-wide Civic Health index is currently ${cityAvgScore}/100. ${
        zonePulses.filter((z) => z.overallScore < 70).length
      } zone(s) under elevated alert status.`,
      generatedAt: new Date().toISOString(),
    };
  }
}

module.exports = new PulseService();
