/**
 * CityPulse Ingestion & Analytics REST Routes
 */

const express = require('express');
const router = express.Router();
const controller = require('./ingestion.controller');

// Sync feeds across all Jaipur zones
router.post('/sync', controller.syncFeeds);
router.get('/sync', controller.syncFeeds);

// Ingest incident
router.post('/incident', controller.ingestIncident);

// Anomalies & Correlations endpoints
router.get('/anomalies', controller.getAnomalies);
router.get('/correlations', controller.getCorrelations);
router.get('/summary', controller.getSummary);

module.exports = router;
