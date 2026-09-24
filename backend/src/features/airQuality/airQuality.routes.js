const express = require('express');
const router = express.Router();
const airQualityController = require('./airQuality.controller');

router.get('/', airQualityController.getAll);
router.get('/latest', airQualityController.getLatest);
router.post('/', airQualityController.create);

module.exports = router;
