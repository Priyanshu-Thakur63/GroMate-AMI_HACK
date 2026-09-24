const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Feature Routes
const weatherRoutes = require('./features/weather/weather.routes');
const incidentRoutes = require('./features/incident/incident.routes');
const airQualityRoutes = require('./features/airQuality/airQuality.routes');
const sentimentRoutes = require('./features/socialSentiment/socialSentiment.routes');
const disasterRoutes = require('./features/disaster/disaster.routes');
const zoneRoutes = require('./features/zone/zone.routes');
const pulseRoutes = require('./features/pulse/pulse.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'CityPulse REST API Engine is active',
    architecture: 'Feature-based modular architecture',
    timestamp: new Date().toISOString(),
  });
});

// Feature API Mounts
app.use('/api/weather', weatherRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/air-quality', airQualityRoutes);
app.use('/api/social-sentiment', sentimentRoutes);
app.use('/api/disaster', disasterRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/pulse', pulseRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Resource ${req.method} ${req.originalUrl} not found`,
    },
  });
});

// Central Error Handler
app.use(errorHandler);

module.exports = app;
