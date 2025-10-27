# Firebase Realtime Database Integration

## Overview

Your GappyAI app has been successfully updated to use Firebase Realtime Database with your new "gappy-ai" project. The integration supports real-time monitoring and control of your aquarium IoT device.

## Database Structure

Your Realtime Database follows this structure:

```
aquarium_sensor_001/
├── controls/
│   ├── autoFeedEnabled: boolean
│   ├── feedNow: boolean
│   ├── lampBrightness: number (0-100)
│   ├── pump1: boolean
│   └── pump2: boolean
├── feeder/
│   ├── autoFeedEnabled: boolean
│   ├── feedCount: number
│   └── nextFeed: string
├── sensors/
│   ├── ammonia: number (ppm)
│   ├── foodEmpty: boolean
│   ├── ph: number
│   ├── temperature: number (°C)
│   ├── turbidity: number (NTU)
│   ├── uv: number
│   ├── waterLevel: number (0-100%)
│   └── waterLevelCm: number
├── outputs/
│   ├── lampBrightness: number (0-100)
│   ├── pump1: boolean
│   └── pump2: boolean
└── lastUpdate: number (timestamp)
```

## Features

### ✅ Real-time Data Sync
- Live sensor readings (temperature, pH, turbidity, ammonia, UV, water level)
- Real-time control status updates
- Automatic UI updates when data changes

### ✅ Device Controls
- **Pump Control**: Turn pumps 1 & 2 on/off
- **Light Control**: Adjust brightness (0-100%)
- **Feeding**: Trigger manual feeding
- **Auto Feed**: Enable/disable automatic feeding

### ✅ Enhanced UI
- New sensor displays (UV index, food status, water level in cm)
- Real-time status indicators
- Improved feeding schedule display
- System status monitoring

## Usage

### For IoT Device Integration

Your IoT device should send data to the Firebase Realtime Database at the path:
```
https://gappy-ai-default-rtdb.asia-southeast1.firebasedatabase.app/aquarium_sensor_001.json
```

Example data payload:
```json
{
  "sensors": {
    "temperature": 25.5,
    "ph": 7.2,
    "turbidity": 5.2,
    "ammonia": 0.1,
    "uv": 950,
    "waterLevel": 85,
    "waterLevelCm": 18.5,
    "foodEmpty": false
  },
  "controls": {
    "lampBrightness": 75,
    "pump1": true,
    "pump2": false
  },
  "lastUpdate": 1761490412493
}
```

### For Manual Testing

You can use the provided test utilities:

```typescript
import { testFirebaseConnection, initializeDeviceData } from '../lib/testFirebaseConnection';

// Test connection
const result = await testFirebaseConnection('aquarium_sensor_001');
console.log(result);

// Initialize with default structure
const initResult = await initializeDeviceData('aquarium_sensor_001');
console.log(initResult);
```

## Configuration

The Firebase configuration is set in your `.env` file:

```env
EXPO_PUBLIC_FIREBASE_API_KEY="AIzaSyAOHVOkwUnt6VqBZeqS16aEwl8YbJ_6oEQ"
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="gappy-ai.firebaseapp.com"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="gappy-ai"
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="gappy-ai.firebasestorage.app"
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="780995888049"
EXPO_PUBLIC_FIREBASE_APP_ID="1:780995888049:web:7f7456793e8a49022eb390"
EXPO_PUBLIC_FIREBASE_DATABASE_URL="https://gappy-ai-default-rtdb.asia-southeast1.firebasedatabase.app"
```

## Migration from Firestore

The app has been migrated from Firestore to Firebase Realtime Database:

- **Before**: Used Firestore collections (`sensor_data`, `devices`, `alerts`)
- **After**: Uses Realtime Database paths (`/aquarium_sensor_001/sensors`, `/aquarium_sensor_001/controls`)

All components now use the new `FirebaseRealtimeService` for real-time data synchronization.

## Next Steps

1. **Test the connection**: Run the app and verify real-time data sync
2. **Configure your IoT device**: Update your device code to send data to the new Firebase project
3. **Customize device ID**: Update the `DEVICE_ID` in the Dashboard if needed
4. **Add more sensors**: Extend the database structure for additional sensor types

## Troubleshooting

- **No data showing**: Check Firebase security rules and ensure your IoT device is sending data
- **Connection errors**: Verify the Firebase configuration in `.env`
- **Real-time not updating**: Check network connectivity and Firebase project settings

## Support

The integration includes:
- Type-safe TypeScript interfaces
- Error handling and loading states
- Automatic cleanup of subscriptions
- Test utilities for debugging
