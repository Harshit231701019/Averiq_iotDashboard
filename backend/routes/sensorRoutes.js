const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

router.get('/live', sensorController.getLiveSensorData);
router.get('/history', sensorController.getSensorHistory);

module.exports = router;
