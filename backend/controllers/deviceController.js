const Device = require('../models/Device');

// GET /api/devices
exports.getAllDevices = async (req, res) => {
    try {
        const devices = await Device.find();
        res.json(devices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/devices/:id
exports.getDeviceById = async (req, res) => {
    try {
        const device = await Device.findOne({ deviceId: req.params.id });
        if (!device) return res.status(404).json({ message: 'Device not found' });
        res.json(device);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/devices
exports.createDevice = async (req, res) => {
    try {
        const device = new Device(req.body);
        const newDevice = await device.save();
        res.status(201).json(newDevice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// PATCH /api/devices/:id/status
exports.updateDeviceStatus = async (req, res) => {
    try {
        const device = await Device.findOneAndUpdate(
            { deviceId: req.params.id },
            { status: req.body.status, lastUpdated: new Date() },
            { new: true }
        );
        if (!device) return res.status(404).json({ message: 'Device not found' });
        res.json(device);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
