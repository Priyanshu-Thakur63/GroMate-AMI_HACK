const express = require('express');
const router = express.Router();
const incidentController = require('./incident.controller');

router.get('/', incidentController.getAll);
router.get('/:id', incidentController.getById);
router.post('/', incidentController.create);
router.patch('/:id', incidentController.update);
router.delete('/:id', incidentController.delete);

module.exports = router;
