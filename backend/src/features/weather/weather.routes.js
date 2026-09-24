const express = require('express');
const router = express.Router();
const weatherController = require('./weather.controller');

router.get('/', weatherController.getAll);
router.get('/latest', weatherController.getLatest);
router.get('/:id', weatherController.getById);
router.post('/', weatherController.create);

module.exports = router;
