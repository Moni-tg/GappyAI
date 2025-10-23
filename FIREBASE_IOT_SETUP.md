# Firebase IoT Integration Setup Guide

## 1. Firebase Project Setup

### Create a Firebase Project (100% FREE!)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or use an existing project
3. Enable **Firestore Database** (in Native mode) - **FREE**
4. Enable **Authentication** (if you plan to add user management) - **FREE**
5. **No Firebase Functions needed** - Everything runs client-side!

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

## 2. Deploy Firestore Security Rules (FREE!)

### Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Login to Firebase
```bash
firebase login
```

### Initialize Project (if not done already)
```bash
cd backend/firebase-functions
firebase init firestore
```

### Deploy Security Rules
```bash
firebase deploy --only firestore
```

**Note**: Firestore rules deploy is completely free and doesn't require any paid plans!

## 3. IoT Device Setup

### Direct Firestore Integration (Recommended)

```javascript
// Example IoT device code (ESP32/Node.js with Firebase SDK)
const firebase = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Initialize Firebase (replace with your config)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id"
};

firebase.initializeApp(firebaseConfig);
const db = getFirestore();

async function sendSensorData(temperature, ph, turbidity, ammonia) {
  try {
    const data = {
      device_id: 'aquarium_sensor_001',
      temperature: temperature,
      ph: ph,
      turbidity: turbidity,
      ammonia: ammonia,
      timestamp: serverTimestamp(),
      location: 'aquarium_1'
    };

    const docRef = await addDoc(collection(db, 'sensor_data'), data);
    console.log('Sensor data sent successfully:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error sending sensor data:', error);
    throw error;
  }
}

// Send data every 30 seconds
setInterval(async () => {
  const sensorData = {
    temperature: 24.5 + (Math.random() - 0.5) * 2, // 23-26°C
    ph: 7.0 + (Math.random() - 0.5) * 0.5, // 6.75-7.25
    turbidity: 3 + Math.random() * 5, // 3-8 NTU
    ammonia: Math.random() * 0.3 // 0-0.3 ppm
  };

  await sendSensorData(
    sensorData.temperature,
    sensorData.ph,
    sensorData.turbidity,
    sensorData.ammonia
  );
}, 30000);
```

### Alternative: HTTP REST API (Without Firebase SDK)

```javascript
// Simple HTTP approach (ESP32/Arduino)
const https = require('https');

function sendSensorData(temperature, ph, turbidity, ammonia) {
  const data = JSON.stringify({
    device_id: 'aquarium_sensor_001',
    temperature: temperature,
    ph: ph,
    turbidity: turbidity,
    ammonia: ammonia,
    location: 'aquarium_1'
  });

  const options = {
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/your-project-id/databases/(default)/documents/sensor_data`,
    method: 'POST',
    headers: {
      'Authorization': 'Bearer your-service-account-key',
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
  });

  req.write(data);
  req.end();
}
```

### Reading Commands from Firestore

Your IoT device can also read control commands from Firestore:

```javascript
// Listen for pump control commands
const { onSnapshot, query, where, orderBy, limit } = require('firebase/firestore');

function listenForCommands(deviceId) {
  const q = query(
    collection(db, 'device_commands'),
    where('device_id', '==', deviceId),
    orderBy('timestamp', 'desc'),
    limit(1)
  );

  return onSnapshot(q, (snapshot) => {
    snapshot.forEach((doc) => {
      const command = doc.data();
      console.log('Received command:', command);

      // Execute command (turn on/off pumps, etc.)
      if (command.pump_id === 'pump_1' && command.action === 'on') {
        // Turn on pump 1
        console.log('Turning on pump 1');
      }
    });
  });
}
```

## 4. React Native App Configuration

### Install Dependencies
```bash
npm install firebase
```

### Initialize Firebase in your app
The Firebase configuration is already set up in `lib/firebase.ts`.

## 5. Testing the Integration

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

// Send test data with correct field names
await iotService.sendSensorData({
  device_id: 'aquarium_sensor_001',
  temperature: 25.0,
  ph: 7.1,
  turbidity: 4.2,
  ammonia: 0.05
});
```

## 6. Monitoring and Alerts

### Real-time Alerts (Client-side Processing)
The React Native app automatically processes sensor data and generates alerts:
- **Temperature**: Outside 20-30°C range
- **pH**: Outside 6.0-8.0 range
- **Turbidity**: Above 10.0 NTU
- **Ammonia**: Above 0.5 ppm

### Viewing Alerts
Alerts are displayed in the Dashboard component and can be acknowledged by users.

## 7. Data Analytics

### Historical Data
The system stores all sensor data in Firestore for analytics:

```typescript
// Get historical data for the last 7 days
const historicalData = await iotService.getHistoricalData('aquarium_sensor_001', 7);
```

## 8. Troubleshooting

### Common Issues

1. **Permission denied**: Ensure Firestore security rules allow device writes
2. **Real-time updates not working**: Check Firebase configuration and network connectivity
3. **Data not appearing**: Verify device ID matches between IoT device and app
4. **Deployment failing**: Make sure you're using the free Spark plan (no Blaze required)

### Debug Mode
Enable debug logging:

```typescript
// In your IoT device code
console.log('Sending data:', sensorData);

// In your React Native app
console.log('Received sensor data:', data);
```

## 9. Production Deployment

### Security Considerations
1. Use Firebase App Check for additional security (optional)
2. Implement proper authentication for sensitive operations
3. Use environment variables for all configuration
4. Regularly rotate API keys and tokens

### Performance Optimization
1. Use Firebase's real-time listeners efficiently
2. Implement data pagination for large datasets
3. Use Firebase's CDN for static assets
4. Monitor Firestore usage in Firebase Console

### Scaling
1. **Firestore scales automatically** - handles high read/write loads
2. **No server management needed** - everything runs client-side
3. Use Firebase's monitoring tools to track performance

## 10. Next Steps

1. ✅ Set up your Firebase project (FREE!)
2. ✅ Deploy Firestore security rules (FREE!)
3. 🔄 Configure your IoT device to send data to Firestore
4. 🔄 Test the real-time integration in your app
5. 🔄 Customize alert thresholds based on your aquarium needs
6. 🔄 Add user authentication for multi-user support

## 11. Cost Breakdown
- **Firestore Database**: Free tier (1GB storage, 50K reads/day)
- **Authentication**: Free
- **No Firebase Functions**: No additional costs
- **Total Cost**: $0/month

For more detailed documentation, visit:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Pricing](https://firebase.google.com/pricing) (See Spark plan for free tier)
