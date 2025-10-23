# GuppyAI Backend

A simple Express.js backend API for the GuppyAI Aquarium Monitoring App.

## Features

- RESTful API endpoints for aquarium data
- Real-time aquarium parameter monitoring (temperature, pH, oxygen, ammonia)
- CORS enabled for React Native/Expo integration
- Health check endpoint
- Error handling and logging

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/aquarium/data` | Get all aquarium data |
| GET | `/api/aquarium/latest` | Get latest values for all parameters |
| GET | `/api/aquarium/:parameter` | Get data for specific parameter |

### Parameters
- `temperature` - Water temperature in °C
- `ph` - pH levels
- `oxygen` - Oxygen levels in mg/L
- `ammonia` - Ammonia levels in ppm

## Installation & Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   # For production
   npm start

   # For development (with auto-restart)
   npm run dev
   ```

4. **Server will start on:** `http://localhost:3000`

## Usage in React Native App

```javascript
// Example: Fetch aquarium data
const response = await fetch('http://localhost:3000/api/aquarium/data');
const data = await response.json();

if (data.success) {
  console.log('Temperature data:', data.data.temperature);
  console.log('pH data:', data.data.ph);
  console.log('Oxygen data:', data.data.oxygen);
  console.log('Ammonia data:', data.data.ammonia);
}
```

## Development

- **Port:** 3000 (configurable via `PORT` environment variable)
- **Environment:** Development-ready with nodemon for auto-restart
- **Security:** Helmet.js for basic security headers
- **Logging:** Morgan for HTTP request logging

## Data Structure

Each parameter returns an array of data points:

```json
[
  { "time": "00:00", "value": 24.2 },
  { "time": "04:00", "value": 24.0 },
  { "time": "08:00", "value": 24.5 },
  // ... more data points
]
```

## Next Steps

- Add database integration (MongoDB, PostgreSQL)
- Implement WebSocket for real-time updates
- Add authentication/authorization
- Add data validation and sanitization
- Implement data persistence and historical tracking
