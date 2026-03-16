const mongoose = require('mongoose');

const sensorDataSchema = mongoose.Schema({
    sensorType: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    deviceId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SensorData', sensorDataSchema);
