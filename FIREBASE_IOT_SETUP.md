# Firebase IoT Integration Setup Guide

## 1. Firebase Project Setup

### Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or use an existing project
3. Enable **Firestore Database** (in Native mode)
4. Enable **Functions** (for serverless IoT data processing)
5. Enable **Authentication** (if you plan to add user management)

### Get Firebase Configuration
1. Go to Project Settings (gear icon) > General tab
2. Scroll down to "Your apps" section
3. Add a web app (or use existing if you have one)
4. Copy the config object values

### Environment Setup
1. Copy `.env.example` to `.env`
2. Fill in your Firebase configuration values:
   ```bash
   EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   # ... etc
   ```

## 2. Deploy Firebase Functions

### Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Login to Firebase
```bash
firebase login
```

### Initialize Functions (if not done already)
```bash
cd backend/firebase-functions
firebase init functions
```

### Install Dependencies
```bash
cd backend/firebase-functions
npm install
```

### Deploy Functions
```bash
firebase deploy --only functions
```

## 3. Firestore Security Rules

The security rules are already configured in `backend/firebase-functions/firestore.rules`. After deployment, these rules will be applied to your Firestore database.

## 4. IoT Device Setup

### Option A: Using Firebase Functions (Recommended)

Your IoT device (ESP32, Arduino, etc.) can send data directly to Firebase:

```javascript
// Example IoT device code (ESP32/Node.js)
const https = require('https');

function sendSensorData(temperature, ph, oxygen, ammonia) {
  const data = JSON.stringify({
    device_id: 'aquarium_sensor_001',
    temperature: temperature,
    ph: ph,
    oxygen: oxygen,
    ammonia: ammonia
  });

  const options = {
    hostname: 'us-central1-your-project-id.cloudfunctions.net',
    path: '/processIoTData',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
  });

  req.write(data);
  req.end();
}
```

### Option B: Using MQTT with Firebase

For more advanced scenarios, you can use MQTT:

```javascript
// MQTT setup (using a library like mqtt.js)
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://your-mqtt-broker.com');

client.on('connect', () => {
  console.log('Connected to MQTT broker');

  // Send data every 30 seconds
  setInterval(() => {
    const sensorData = {
      device_id: 'aquarium_sensor_001',
      temperature: 24.5,
      ph: 7.2,
      oxygen: 8.0,
      ammonia: 0.1
    };

    client.publish('aquarium/sensors', JSON.stringify(sensorData));
  }, 30000);
});
```

## 5. React Native App Configuration

### Install Dependencies
```bash
npm install firebase
```

### Initialize Firebase in your app
The Firebase configuration is already set up in `lib/firebase.ts`.

## 6. Testing the Integration

### Test Data Simulation
The app includes a data simulation feature for testing:

```typescript
// In your Dashboard component, this is already enabled for demo
const stopSimulation = iotService.startDataSimulation(DEVICE_ID, 5000);
```

### Manual Testing
You can also manually send test data:

```typescript
import { iotService } from '../services/iotService';

// Send test data
await iotService.sendSensorData({
  device_id: 'aquarium_sensor_001',
  temperature: 25.0,
  ph: 7.1,
  oxygen: 8.2,
  ammonia: 0.05
});
```

## 7. Monitoring and Alerts

### Real-time Alerts
The system automatically generates alerts based on sensor readings:
- Temperature: Outside 20-30°C range
- pH: Outside 6.0-8.0 range
- Oxygen: Below 5.0 mg/L
- Ammonia: Above 0.5 ppm

### Viewing Alerts
Alerts are displayed in the Dashboard component and can be acknowledged by users.

## 8. Data Analytics

### Historical Data
The system stores daily summaries for analytics:

```typescript
// Get 7 days of historical data
const historicalData = await iotService.getHistoricalData('aquarium_sensor_001', 7);
```

## 9. Troubleshooting

### Common Issues

1. **Functions not deploying**: Check Firebase CLI login and project configuration
2. **Permission denied**: Ensure Firestore security rules allow device writes
3. **Real-time updates not working**: Check Firebase configuration and network connectivity
4. **Data not appearing**: Verify device ID matches between IoT device and app

### Debug Mode
Enable debug logging:

```typescript
// In your IoT device code
console.log('Sending data:', sensorData);

// In your React Native app
console.log('Received sensor data:', data);
```

## 10. Production Deployment

### Security Considerations
1. Use Firebase App Check for additional security
2. Implement proper authentication for sensitive operations
3. Use environment variables for all configuration
4. Regularly rotate API keys and tokens

### Performance Optimization
1. Use Firebase's real-time listeners efficiently
2. Implement data pagination for large datasets
3. Use Firebase's CDN for static assets
4. Monitor function execution time and memory usage

### Scaling
1. Firebase Functions scale automatically
2. Firestore handles high read/write loads
3. Use Firebase's monitoring tools to track performance

## Next Steps

1. Set up your Firebase project and deploy the functions
2. Configure your IoT device to send data to Firebase
3. Test the real-time integration in your app
4. Customize alert thresholds based on your aquarium needs
5. Add user authentication for multi-user support

For more detailed documentation, visit:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Functions Documentation](https://firebase.google.com/docs/functions)
