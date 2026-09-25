/**
 * CityPulse Anomaly Detection Service
 * Analyzes normalized observations in PostgreSQL using rolling baseline and Z-score deviation
 */

const { prisma } = require('../config/database');

class AnomalyService {
  /**
   * Run anomaly detection for a specific zone and metric type
   */
  async detectAnomaliesForZone(zoneId) {
    const detectedAnomalies = [];
    const metricsToEvaluate = ['RAINFALL', 'PM25', 'TEMPERATURE', 'PUBLIC_TONE', 'INCIDENT_EVENT'];

    for (const metric of metricsToEvaluate) {
      // Fetch past 30 observations for this zone and metric
      const history = await prisma.civicObservation.findMany({
        where: {
          zoneId,
          metricType: metric
        },
        orderBy: { observedAt: 'desc' },
        take: 30
      });

      if (history.length < 3) continue;

      const current = history[0];
      const baselineValues = history.slice(1).map(h => h.value);

      const mean = baselineValues.reduce((a, b) => a + b, 0) / baselineValues.length;
      const variance = baselineValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / baselineValues.length;
      const stdDev = Math.sqrt(variance);

      // Safe Z-Score calculation with small epsilon
      const epsilon = metric === 'PUBLIC_TONE' ? 0.05 : 0.5;
      const zScore = Math.abs(current.value - mean) / (stdDev + epsilon);

      // Anomaly thresholds
      let severity = null;
      let message = null;

      if (metric === 'RAINFALL' && current.value >= 15.0 && zScore >= 2.0) {
        severity = current.value >= 25.0 ? 'CRITICAL' : 'ELEVATED';
        message = `Sudden heavy rainfall spike of ${current.value.toFixed(1)} mm (Z-Score: +${zScore.toFixed(1)} vs baseline ${mean.toFixed(1)} mm)`;
      } else if (metric === 'PM25' && current.value >= 120 && zScore >= 2.0) {
        severity = current.value >= 200 ? 'CRITICAL' : 'ELEVATED';
        message = `Severe particulate surge: PM2.5 reached ${current.value.toFixed(0)} µg/m³ (+${zScore.toFixed(1)}σ above normal)`;
      } else if (metric === 'PUBLIC_TONE' && current.value <= -0.5 && zScore >= 1.8) {
        severity = current.value <= -0.7 ? 'CRITICAL' : 'ELEVATED';
        message = `Public distress sentiment plunge: Tone index dropped to ${current.value.toFixed(2)} (${zScore.toFixed(1)}σ negative deviation)`;
      } else if (metric === 'TEMPERATURE' && current.value >= 42.0 && zScore >= 2.0) {
        severity = 'CRITICAL';
        message = `Extreme heatwave threshold breached: ${current.value.toFixed(1)} °C (+${zScore.toFixed(1)}σ above baseline)`;
      }

      if (severity && message) {
        // Record anomaly in database
        const log = await prisma.anomalyLog.create({
          data: {
            zoneId,
            metricType: `${metric}_ANOMALY`,
            severity,
            deviationZ: Number(zScore.toFixed(2)),
            message,
            detectedAt: new Date()
          }
        });
        detectedAnomalies.push(log);
      }
    }

    return detectedAnomalies;
  }

  /**
   * Get recent active anomalies across all Jaipur zones
   */
  async getRecentAnomalies(limit = 20) {
    return prisma.anomalyLog.findMany({
      orderBy: { detectedAt: 'desc' },
      take: limit,
      include: {
        zone: true
      }
    });
  }
}

module.exports = new AnomalyService();
