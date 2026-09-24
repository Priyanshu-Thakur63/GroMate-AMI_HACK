const express = require('express');
const router = express.Router();
const disasterController = require('./disaster.controller');

router.get('/', disasterController.getAll);
router.get('/active', disasterController.getActive);
router.get('/:id', disasterController.getById);
router.post('/', disasterController.create);
router.patch('/:id', disasterController.update);

module.exports = router;
