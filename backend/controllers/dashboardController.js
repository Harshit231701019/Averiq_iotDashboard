const Device = require('../models/Device');
const Alert = require('../models/Alert');

// GET /api/dashboard/summary
exports.getSummary = async (req, res) => {
    try {
        const totalDevices = await Device.countDocuments();
        const onlineDevices = await Device.countDocuments({ status: 'Online' });
        const offlineDevices = totalDevices - onlineDevices;
        const activeAlerts = await Alert.countDocuments({ status: 'Active' });

        res.json({
            totalDevices,
            onlineDevices,
            offlineDevices,
            activeAlerts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/risks
exports.getRisks = async (req, res) => {
    const risks = [
        { hazard: 'Gas leakage', sensor: 'Gas sensor', severity: 'Critical' },
        { hazard: 'Cold storage hazard', sensor: 'Temperature sensor', severity: 'Warning' },
        { hazard: 'Moisture hazard', sensor: 'Humidity sensor', severity: 'Warning' },
        { hazard: 'Machine proximity risk', sensor: 'Motion sensor', severity: 'Critical' }
    ];
    res.json(risks);
};
