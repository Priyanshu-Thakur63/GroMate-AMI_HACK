const express = require('express');
const router = express.Router();
const pulseController = require('./pulse.controller');

router.get('/', pulseController.getCityPulse);
router.get('/zone/:zoneId', pulseController.getZonePulse);

module.exports = router;
