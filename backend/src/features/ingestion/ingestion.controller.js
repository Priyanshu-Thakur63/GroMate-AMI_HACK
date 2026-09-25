/**
 * CityPulse Ingestion & Analytics Controller
 */

const ingestionService = require('./ingestion.service');
const anomalyService = require('../../analytics/anomaly.service');
const correlationService = require('../../analytics/correlation.service');
const prisma = require('../../config/database');

class IngestionController {
  /**
   * Trigger manual or scheduled sync across all Jaipur feeds
   */
  async syncFeeds(req, res, next) {
    try {
      const results = await ingestionService.syncAllZones();
      res.status(200).json({
        success: true,
        message: 'CityPulse multi-feed synchronization complete',
        timestamp: new Date().toISOString(),
        data: results
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get all active and recent anomalies
   */
  async getAnomalies(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 20;
      const anomalies = await anomalyService.getRecentAnomalies(limit);
      res.status(200).json({
        success: true,
        count: anomalies.length,
        data: anomalies
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get all cross-source correlations
   */
  async getCorrelations(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const correlations = await correlationService.getRecentCorrelations(limit);
      res.status(200).json({
        success: true,
        count: correlations.length,
        data: correlations
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get plain-language summary for Jaipur civic state
   */
  async getSummary(req, res, next) {
    try {
      const [zones, anomalies, correlations, incidents] = await Promise.all([
        prisma.zone.findMany(),
        anomalyService.getRecentAnomalies(5),
        correlationService.getRecentCorrelations(5),
        prisma.incidentReport.findMany({
          where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
          orderBy: { reportedAt: 'desc' },
          take: 10
        })
      ]);

      const plainLanguageSummary = {
        city: 'Jaipur',
        status: anomalies.length > 0 || correlations.length > 0 ? 'ELEVATED_WATCH' : 'NORMAL',
        headline: correlations.length > 0 
          ? correlations[0].title 
          : `Jaipur Civic Health normal across all ${zones.length} monitored municipal zones.`,
        keyInsights: [
          correlations.length > 0 ? correlations[0].summary : 'No severe cross-feed correlations detected.',
          anomalies.length > 0 ? anomalies[0].message : 'All atmospheric and civic metrics within normal standard deviations.',
          `Currently tracking ${incidents.length} active civic reports across Jaipur.`
        ],
        recentCorrelations: correlations,
        recentAnomalies: anomalies,
        generatedAt: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        data: plainLanguageSummary
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Ingest a civic incident through the adapter
   */
  async ingestIncident(req, res, next) {
    try {
      const { title, category, severity, description, zoneId, latitude, longitude } = req.body;
      if (!title || !zoneId) {
        return res.status(400).json({ success: false, error: 'Title and zoneId are required' });
      }

      const incident = await ingestionService.ingestIncident({
        title,
        category,
        severityLevel: severity,
        description,
        latitude,
        longitude
      }, zoneId);

      res.status(201).json({
        success: true,
        message: 'Incident ingested and normalized into CDM',
        data: incident
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new IngestionController();
