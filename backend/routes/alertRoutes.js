const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

router.get('/', alertController.getAllAlerts);
router.get('/active', alertController.getActiveAlerts);
router.post('/clear/:id', alertController.clearAlert);

module.exports = router;
