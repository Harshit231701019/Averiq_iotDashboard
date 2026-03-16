const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');
const Device = require('../models/Device');

const THRESHOLDS = {
    TEMPERATURE: 40,
    HUMIDITY: 85,
    CO2: 1000,
    PRESSURE: 995 // Alert if pressure < 995
};

const simulateSensorData = async () => {
    try {
        const devices = await Device.find({ status: 'Online' });
        
        for (const device of devices) {
            // Generate simulated values
            const data = {
                temperature: 25 + Math.random() * 20, // 25-45
                humidity: 40 + Math.random() * 50,    // 40-90
                co2: 300 + Math.random() * 900,       // 300-1200
                pressure: 990 + Math.random() * 40,   // 990-1030
                motion: Math.random() > 0.8           // true/false
            };

            const sensors = [
                { type: 'Temperature', value: data.temperature, unit: '°C' },
                { type: 'Humidity', value: data.humidity, unit: '%' },
                { type: 'CO2', value: data.co2, unit: 'ppm' },
                { type: 'Pressure', value: data.pressure, unit: 'hPa' },
                { type: 'Motion', value: data.motion ? 1 : 0, unit: 'bool' }
            ];

            // Save sensor data
            for (const sensor of sensors) {
                await SensorData.create({
                    sensorType: sensor.type,
                    value: sensor.value,
                    unit: sensor.unit,
                    deviceId: device.deviceId
                });

                // Check thresholds
                await checkThresholds(sensor, device.name);
            }

            // Update device last updated timestamp
            await Device.findOneAndUpdate({ deviceId: device.deviceId }, { lastUpdated: new Date() });
        }
    } catch (error) {
        console.error('Simulation Error:', error.message);
    }
};

const checkThresholds = async (sensor, deviceName) => {
    let alertNeeded = false;
    let message = '';
    let severity = 'Info';

    if (sensor.type === 'Temperature' && sensor.value > THRESHOLDS.TEMPERATURE) {
        alertNeeded = true;
        message = `High temperature detected on ${deviceName}: ${sensor.value.toFixed(1)}°C`;
        severity = 'Critical';
    } else if (sensor.type === 'Humidity' && sensor.value > THRESHOLDS.HUMIDITY) {
        alertNeeded = true;
        message = `High humidity detected on ${deviceName}: ${sensor.value.toFixed(1)}%`;
        severity = 'Warning';
    } else if (sensor.type === 'CO2' && sensor.value > THRESHOLDS.CO2) {
        alertNeeded = true;
        message = `High CO2 levels detected on ${deviceName}: ${Math.round(sensor.value)} ppm`;
        severity = 'Critical';
    } else if (sensor.type === 'Pressure' && sensor.value < THRESHOLDS.PRESSURE) {
        alertNeeded = true;
        message = `Low pressure detected on ${deviceName}: ${Math.round(sensor.value)} hPa`;
        severity = 'Warning';
    }

    if (alertNeeded) {
        // Only create alert if not already active for same type/message recently
        const recentAlert = await Alert.findOne({ 
            sensorType: sensor.type, 
            status: 'Active',
            timestamp: { $gt: new Date(Date.now() - 60000) } // within last minute
        });

        if (!recentAlert) {
            await Alert.create({
                sensorType: sensor.type,
                message,
                severity,
                status: 'Active'
            });
            console.log(`[ALERT] ${message}`);
        }
    }
};

const startSimulation = () => {
    console.log('Starting IoT Sensor Simulation (3s interval)...');
    setInterval(simulateSensorData, 3000);
};

module.exports = { startSimulation };
