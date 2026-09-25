const express = require('express');
const trafficController = require('./traffic.controller');

const router = express.Router();

router.get('/', (req, res, next) => trafficController.getTrafficFeed(req, res, next));

module.exports = router;
