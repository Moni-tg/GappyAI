// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue, set, update, push, remove, get } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('🔥 Firebase app initialized:', app.name);
  console.log('🌐 Database URL:', firebaseConfig.databaseURL);
} catch (error) {
  console.error('❌ Error initializing Firebase:', error);
  // Create a mock Firebase setup for development when env vars are missing
  console.warn('⚠️ Using mock Firebase configuration for development');
  app = initializeApp({
    apiKey: "demo-key",
    authDomain: "demo.firebaseapp.com",
    databaseURL: "https://demo.firebaseio.com",
    projectId: "demo",
    storageBucket: "demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:demo"
  });
}

// Initialize Firebase services
export const db = getDatabase(app);
export const auth = getAuth(app);

console.log('🗄️ Database reference created');
console.log('🔐 Auth reference created');

// Realtime Database paths - Data is at root level
export const CONTROLS_PATH = ''; // Empty since controls are at root
export const FEEDER_PATH = '';   // Empty since feeder data is at root
export const SENSORS_PATH = ''; // Empty since sensors are at root
export const OUTPUTS_PATH = ''; // Empty since outputs are at root
export const LAST_UPDATE_PATH = ''; // Empty since lastUpdate is at root

// Types for IoT data based on your database structure
export interface ControlsData {
  autoFeedEnabled: boolean;
  feedNow: boolean;
  lampBrightness: number;
  pump1: boolean;
  pump2: boolean;
}

export interface FeederData {
  autoFeedEnabled: boolean;
  feedCount: number;
  nextFeed: string;
}

export interface SensorsData {
  ammonia: number;
  foodEmpty: boolean;
  ph: number;
  temperature: number;
  turbidity: number;
  uv: number;
  waterLevel: number;
  waterLevelCm: number;
}

export interface OutputsData {
  lampBrightness: number;
  pump1: boolean;
  pump2: boolean;
}

export interface RealtimeData {
  controls: ControlsData;
  feeder: FeederData;
  lastUpdate: number;
  outputs: OutputsData;
  sensors: SensorsData;
}

// Real-time database service class
export class FirebaseRealtimeService {
  private unsubscribeFunctions: (() => void)[] = [];

  // Subscribe to real-time updates for the entire device data
  subscribeToDeviceData(deviceId: string, callback: (data: RealtimeData) => void) {
    const deviceRef = ref(db); // Root level, no device ID

    console.log('🔄 Setting up realtime subscription for device:', deviceId);
    console.log('📍 Database path:', deviceRef.toString());

    const unsubscribe = onValue(deviceRef, (snapshot) => {
      const data = snapshot.val() as RealtimeData;
      console.log('📡 Firebase snapshot received:', data);

      if (data) {
        console.log('✅ Valid data received, calling callback');
        callback(data);
      } else {
        console.log('⚠️ No data available at path:', deviceRef.toString());
      }
    }, (error) => {
      console.error('❌ Error subscribing to device data:', error);
    });

    this.unsubscribeFunctions.push(unsubscribe);
    return unsubscribe;
  }

  // Subscribe to specific sensor data
  subscribeToSensors(deviceId: string, callback: (sensors: SensorsData) => void) {
    const sensorsRef = ref(db); // Root level, no device ID

    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      const data = snapshot.val() as RealtimeData;
      if (data && data.sensors) {
        callback(data.sensors);
      }
    }, (error) => {
      console.error('Error subscribing to sensors:', error);
    });

    this.unsubscribeFunctions.push(unsubscribe);
    return unsubscribe;
  }

  // Subscribe to controls
  subscribeToControls(deviceId: string, callback: (controls: ControlsData) => void) {
    const controlsRef = ref(db); // Root level, no device ID

    const unsubscribe = onValue(controlsRef, (snapshot) => {
      const data = snapshot.val() as RealtimeData;
      if (data && data.controls) {
        callback(data.controls);
      }
    }, (error) => {
      console.error('Error subscribing to controls:', error);
    });

    this.unsubscribeFunctions.push(unsubscribe);
    return unsubscribe;
  }

  // Trigger feed now
  async triggerFeed(deviceId: string) {
    try {
      // First read current controls to preserve other values
      const deviceRef = ref(db); // Root level, no device ID
      const snapshot = await get(deviceRef);
      const currentData = snapshot.val() as RealtimeData;

      if (currentData && currentData.controls) {
        await update(deviceRef, {
          controls: {
            ...currentData.controls,
            feedNow: true
          }
        });
        console.log('Feed triggered successfully');
      } else {
        console.error('No existing controls data found');
      }
    } catch (error) {
      console.error('Error triggering feed:', error);
      throw error;
    }
  }

  // Update lamp brightness
  async updateLampBrightness(deviceId: string, brightness: number) {
    try {
      // First read current controls to preserve other values
      const deviceRef = ref(db); // Root level, no device ID
      const snapshot = await get(deviceRef);
      const currentData = snapshot.val() as RealtimeData;

      if (currentData && currentData.controls) {
        await update(deviceRef, {
          controls: {
            ...currentData.controls,
            lampBrightness: brightness
          }
        });
        console.log(`Lamp brightness updated to ${brightness}% successfully`);
      } else {
        console.error('No existing controls data found');
      }
    } catch (error) {
      console.error('Error updating lamp brightness:', error);
      throw error;
    }
  }

  // Toggle pump
  async togglePump(deviceId: string, pump: 'pump1' | 'pump2', state: boolean) {
    try {
      // First read current controls to preserve other values
      const deviceRef = ref(db); // Root level, no device ID
      const snapshot = await get(deviceRef);
      const currentData = snapshot.val() as RealtimeData;

      if (currentData && currentData.controls) {
        await update(deviceRef, {
          controls: {
            ...currentData.controls,
            [pump]: state
          }
        });
        console.log(`Pump ${pump} ${state ? 'turned on' : 'turned off'} successfully`);
      } else {
        console.error('No existing controls data found');
      }
    } catch (error) {
      console.error(`Error toggling pump ${pump}:`, error);
      throw error;
    }
  }

  // Clean up all subscriptions
  cleanup() {
    this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    this.unsubscribeFunctions = [];
  }

  // Populate database with test data for development
  async populateWithTestData(deviceId: string) {
    try {
      console.log('🧪 [DEV MODE] Populating database with test data...');
      const deviceRef = ref(db); // Root level, no device ID

      const testData: RealtimeData = {
        sensors: {
          temperature: 25,
          ph: 4.95,
          turbidity: 200,
          ammonia: 5,
          uv: 970,
          waterLevel: 0,
          waterLevelCm: 0,
          foodEmpty: true
        },
        controls: {
          autoFeedEnabled: true,
          feedNow: false,
          lampBrightness: 100,
          pump1: false,
          pump2: false
        },
        feeder: {
          autoFeedEnabled: true,
          feedCount: 0,
          nextFeed: '9h 39m'
        },
        outputs: {
          lampBrightness: 100,
          pump1: false,
          pump2: false
        },
        lastUpdate: Date.now()
      };

      await set(deviceRef, testData);
      console.log('✅ Test data populated successfully');
      return testData;
    } catch (error) {
      console.error('❌ Error populating test data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const firebaseRealtime = new FirebaseRealtimeService();

// Helper functions for data processing
export const processSensorData = (rawData: SensorsData) => {
  return {
    ammonia: parseFloat(rawData.ammonia.toString()),
    foodEmpty: Boolean(rawData.foodEmpty),
    ph: parseFloat(rawData.ph.toString()),
    temperature: parseFloat(rawData.temperature.toString()),
    turbidity: parseFloat(rawData.turbidity.toString()),
    uv: parseFloat(rawData.uv.toString()),
    waterLevel: parseFloat(rawData.waterLevel.toString()),
    waterLevelCm: parseFloat(rawData.waterLevelCm.toString()),
  };
};

export const checkAlertConditions = (sensors: SensorsData): { type: string; severity: string; message: string } | null => {
  // Temperature alert
  if (sensors.temperature < 20 || sensors.temperature > 30) {
    return {
      type: 'temperature',
      severity: sensors.temperature < 18 || sensors.temperature > 32 ? 'critical' : 'high',
      message: `Temperature ${sensors.temperature}°C is outside normal range (20-30°C)`
    };
  }

  // pH alert
  if (sensors.ph < 6.0 || sensors.ph > 8.0) {
    return {
      type: 'ph',
      severity: sensors.ph < 5.5 || sensors.ph > 8.5 ? 'critical' : 'high',
      message: `pH level ${sensors.ph} is outside normal range (6.0-8.0)`
    };
  }

  // Turbidity alert
  if (sensors.turbidity > 10.0) {
    return {
      type: 'turbidity',
      severity: sensors.turbidity > 15.0 ? 'critical' : 'medium',
      message: `Turbidity level ${sensors.turbidity} NTU is above normal (10.0 NTU)`
    };
  }

  // Ammonia alert
  if (sensors.ammonia > 0.5) {
    return {
      type: 'ammonia',
      severity: sensors.ammonia > 1.0 ? 'critical' : 'medium',
      message: `Ammonia level ${sensors.ammonia} ppm is above normal (0.5 ppm)`
    };
  }

  return null;
};
