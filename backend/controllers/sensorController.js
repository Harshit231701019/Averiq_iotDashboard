const SensorData = require('../models/SensorData');

// GET /api/sensors/live
exports.getLiveSensorData = async (req, res) => {
    try {
        // Get the latest reading for each sensor type
        const sensorTypes = ['Temperature', 'Humidity', 'CO2', 'Pressure', 'Motion'];
        const liveData = {};

        for (const type of sensorTypes) {
            const latest = await SensorData.findOne({ sensorType: type }).sort({ timestamp: -1 });
            if (latest) {
                liveData[type.toLowerCase()] = {
                    value: latest.value,
                    unit: latest.unit,
                    timestamp: latest.timestamp
                };
            }
        }
        res.json(liveData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/sensors/history
exports.getSensorHistory = async (req, res) => {
    try {
        const history = await SensorData.find().sort({ timestamp: -1 }).limit(100);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
