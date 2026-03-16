const mongoose = require('mongoose');

const deviceSchema = mongoose.Schema({
    deviceId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    industry: { type: String, required: true },
    status: { type: String, enum: ['Online', 'Offline'], default: 'Online' },
    location: { type: String },
    lastUpdated: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Device', deviceSchema);
