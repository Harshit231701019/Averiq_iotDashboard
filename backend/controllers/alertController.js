const Alert = require('../models/Alert');

// GET /api/alerts
exports.getAllAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find().sort({ timestamp: -1 });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/alerts/active
exports.getActiveAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find({ status: 'Active' }).sort({ timestamp: -1 });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/alerts/clear/:id
exports.clearAlert = async (req, res) => {
    try {
        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            { status: 'Resolved' },
            { new: true }
        );
        if (!alert) return res.status(404).json({ message: 'Alert not found' });
        res.json(alert);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
