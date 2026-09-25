/**
 * CityPulse Cross-Source Correlation Engine
 * Detects cross-domain patterns (e.g. Rainfall + Waterlogging + Traffic Spikes + Sentiment Plunge)
 */

const prisma = require('../config/database');

class CorrelationService {
  /**
   * Evaluates multi-source feeds for a zone within a 45-minute temporal window
   */
  async evaluateZoneCorrelations(zoneId) {
    const windowStart = new Date(Date.now() - 45 * 60 * 1000);

    const [zone, recentObs, recentIncidents, recentSentiment] = await Promise.all([
      prisma.zone.findUnique({ where: { id: zoneId } }),
      prisma.civicObservation.findMany({
        where: {
          zoneId,
          observedAt: { gte: windowStart }
        },
        orderBy: { observedAt: 'desc' }
      }),
      prisma.incidentReport.findMany({
        where: {
          zoneId,
          status: { in: ['OPEN', 'IN_PROGRESS'] },
          reportedAt: { gte: windowStart }
        }
      }),
      prisma.socialSentiment.findMany({
        where: {
          zoneId,
          postedAt: { gte: windowStart }
        }
      })
    ]);

    if (!zone) return [];

    const correlations = [];

    // Extract key metrics from recent window
    const rainObs = recentObs.find(o => o.metricType === 'RAINFALL' && o.value > 0);
    const rainValue = rainObs ? rainObs.value : 0;

    const waterloggingIncs = recentIncidents.filter(i => 
      i.category === 'WATERLOGGING' || i.title.toLowerCase().includes('water')
    );
    const trafficIncs = recentIncidents.filter(i => 
      i.category === 'TRAFFIC_JAM' || i.title.toLowerCase().includes('traffic') || i.title.toLowerCase().includes('jam')
    );

    const avgSentiment = recentSentiment.length > 0
      ? recentSentiment.reduce((acc, s) => acc + s.sentimentScore, 0) / recentSentiment.length
      : 0;

    // Pattern 1: Rain-Induced Waterlogging & Traffic Choke
    if (rainValue >= 10.0 && (waterloggingIncs.length > 0 || trafficIncs.length > 0)) {
      const summary = `Heavy localized precipitation (${rainValue.toFixed(1)} mm) in ${zone.name} is correlating with ${waterloggingIncs.length + trafficIncs.length} active road obstructions and a notable negative public sentiment (${avgSentiment.toFixed(2)}).`;
      
      const log = await prisma.correlationLog.create({
        data: {
          zoneId,
          title: `Rain-Induced Drainage & Traffic Gridlock in ${zone.name}`,
          summary,
          confidence: Math.min(0.96, 0.70 + (rainValue * 0.01) + (waterloggingIncs.length * 0.05)),
          sources: ['WEATHER', 'INCIDENT', 'SENTIMENT'],
          detectedAt: new Date()
        }
      });
      correlations.push(log);
    }

    // Pattern 2: Air Quality Stagnation & Citizen Respiratory Distress
    const pm25Obs = recentObs.find(o => o.metricType === 'PM25');
    if (pm25Obs && pm25Obs.value >= 140 && avgSentiment <= -0.3) {
      const summary = `Particulate concentration (PM2.5: ${pm25Obs.value} µg/m³) in ${zone.name} has crossed hazardous advisory thresholds, aligning with an uptick in citizen air quality complaints across local feeds.`;
      
      const log = await prisma.correlationLog.create({
        data: {
          zoneId,
          title: `Industrial Smog & Public Discontent Surge in ${zone.name}`,
          summary,
          confidence: 0.88,
          sources: ['AIR_QUALITY', 'SENTIMENT'],
          detectedAt: new Date()
        }
      });
      correlations.push(log);
    }

    return correlations;
  }

  /**
   * Get latest correlation findings across Jaipur
   */
  async getRecentCorrelations(limit = 10) {
    return prisma.correlationLog.findMany({
      orderBy: { detectedAt: 'desc' },
      take: limit,
      include: {
        zone: true
      }
    });
  }
}

module.exports = new CorrelationService();
