const express = require('express');
const router = express.Router();
const socialSentimentController = require('./socialSentiment.controller');

router.get('/', socialSentimentController.getAll);
router.get('/summary', socialSentimentController.getSummary);
router.post('/', socialSentimentController.create);

module.exports = router;
