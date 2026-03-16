const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { startSimulation } = require('./services/sensorSimulator');
const Device = require('./models/Device');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/devices', require('./routes/deviceRoutes'));
app.use('/api/sensors', require('./routes/sensorRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.get('/api/risks', require('./controllers/dashboardController').getRisks);

// Seed Initial Data if no devices exist
const seedData = async () => {
    const count = await Device.countDocuments();
    if (count === 0) {
        console.log('Seeding initial IoT devices...');
        const initialDevices = [
            { deviceId: 'TEMP-001', name: 'Zone A Temp', type: 'Temperature', industry: 'Manufacturing', status: 'Online', location: 'Floor 1' },
            { deviceId: 'HUM-001', name: 'Storage Humidity', type: 'Humidity', industry: 'Food Industry', status: 'Online', location: 'Cold Store' },
            { deviceId: 'GAS-001', name: 'Main Gas Sensor', type: 'Gas', industry: 'Manufacturing', status: 'Online', location: 'Plant B' },
            { deviceId: 'PRES-001', name: 'Boiler Pressure', type: 'Pressure', industry: 'Manufacturing', status: 'Online', location: 'Boiler Room' },
            { deviceId: 'MOT-001', name: 'Gate Motion', type: 'Motion', industry: 'Construction', status: 'Online', location: 'Gate 2' }
        ];
        await Device.insertMany(initialDevices);
    }
};
seedData();

// Start Simulation
startSimulation();

app.listen(PORT, () => {
    console.log(`IoT Backend Server running on port ${PORT}`);
});
