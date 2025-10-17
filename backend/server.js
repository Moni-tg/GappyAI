const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Sample aquarium data
const aquariumData = {
  temperature: [
    { time: '00:00', value: 24.2 },
    { time: '04:00', value: 24.0 },
    { time: '08:00', value: 24.5 },
    { time: '12:00', value: 25.1 },
    { time: '16:00', value: 24.8 },
    { time: '20:00', value: 24.3 },
  ],
  ph: [
    { time: '00:00', value: 7.2 },
    { time: '04:00', value: 7.1 },
    { time: '08:00', value: 7.0 },
    { time: '12:00', value: 6.9 },
    { time: '16:00', value: 7.0 },
    { time: '20:00', value: 7.1 },
  ],
  oxygen: [
    { time: '00:00', value: 8.2 },
    { time: '04:00', value: 8.0 },
    { time: '08:00', value: 8.5 },
    { time: '12:00', value: 9.1 },
    { time: '16:00', value: 8.8 },
    { time: '20:00', value: 8.3 },
  ],
  ammonia: [
    { time: '00:00', value: 0.2 },
    { time: '04:00', value: 0.25 },
    { time: '08:00', value: 0.3 },
    { time: '12:00', value: 0.25 },
    { time: '16:00', value: 0.2 },
    { time: '20:00', value: 0.18 },
  ]
};

// API Routes

// Get all aquarium data
app.get('/api/aquarium/data', (req, res) => {
  res.json({
    success: true,
    data: aquariumData,
    timestamp: new Date().toISOString()
  });
});

// Get specific parameter data
app.get('/api/aquarium/:parameter', (req, res) => {
  const { parameter } = req.params;
  const validParameters = ['temperature', 'ph', 'oxygen', 'ammonia'];

  if (!validParameters.includes(parameter)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid parameter. Valid parameters: temperature, ph, oxygen, ammonia'
    });
  }

  res.json({
    success: true,
    parameter,
    data: aquariumData[parameter],
    timestamp: new Date().toISOString()
  });
});

// Get latest values for all parameters
app.get('/api/aquarium/latest', (req, res) => {
  const latestData = {
    temperature: aquariumData.temperature[aquariumData.temperature.length - 1],
    ph: aquariumData.ph[aquariumData.ph.length - 1],
    oxygen: aquariumData.oxygen[aquariumData.oxygen.length - 1],
    ammonia: aquariumData.ammonia[aquariumData.ammonia.length - 1]
  };

  res.json({
    success: true,
    data: latestData,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'GuppyAI Backend API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GuppyAI Backend Server running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

module.exports = app;
