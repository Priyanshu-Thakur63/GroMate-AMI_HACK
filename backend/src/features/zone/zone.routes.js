const express = require('express');
const router = express.Router();
const zoneController = require('./zone.controller');

router.get('/', zoneController.getAll);
router.get('/:id', zoneController.getById);
router.post('/', zoneController.create);

module.exports = router;
