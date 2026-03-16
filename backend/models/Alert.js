const mongoose = require('mongoose');

const alertSchema = mongoose.Schema({
    sensorType: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['Critical', 'Warning', 'Info'], default: 'Info' },
    status: { type: String, enum: ['Active', 'Resolved'], default: 'Active' },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);
