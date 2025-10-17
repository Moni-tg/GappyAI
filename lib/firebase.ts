// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

// Collection references
export const SENSOR_DATA_COLLECTION = 'sensor_data';
export const DEVICES_COLLECTION = 'devices';
export const ALERTS_COLLECTION = 'alerts';
export const FEEDING_SCHEDULE_COLLECTION = 'feeding_schedule';

// Types for IoT data
export interface SensorData {
  device_id: string;
  temperature: number;
  ph: number;
  turbidity: number;
  ammonia: number;
  waterLevel?: number;  // Added water level percentage
  timestamp: any; // Firestore timestamp
  location?: string;
}

export interface DeviceInfo {
  device_id: string;
  name: string;
  type: 'aquarium_sensor' | 'feeder' | 'light_controller';
  is_active: boolean;
  last_seen: any;
  location?: string;
}

export interface Alert {
  device_id: string;
  type: 'temperature' | 'ph' | 'turbidity' | 'ammonia' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: any;
  acknowledged: boolean;
}

// Real-time sensor data listener
export class FirebaseRealtimeService {
  private unsubscribeFunctions: (() => void)[] = [];

  // Subscribe to real-time sensor data updates
  subscribeToSensorData(
    deviceId: string,
    callback: (data: SensorData[]) => void,
    maxResults: number = 50
  ) {
    const q = query(
      collection(db, SENSOR_DATA_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(maxResults)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sensorData: SensorData[] = [];
      querySnapshot.forEach((doc: any) => {
        const data = doc.data() as SensorData;
        if (data.device_id === deviceId) {
          sensorData.push(data);
        }
      });
      callback(sensorData);
    });

    this.unsubscribeFunctions.push(unsubscribe);
    return unsubscribe;
  }

  // Subscribe to device status updates
  subscribeToDeviceStatus(
    deviceId: string,
    callback: (device: DeviceInfo) => void
  ) {
    const unsubscribe = onSnapshot(
      collection(db, DEVICES_COLLECTION),
      (querySnapshot) => {
        querySnapshot.forEach((doc: any) => {
          const device = doc.data() as DeviceInfo;
          if (device.device_id === deviceId) {
            callback(device);
          }
        });
      }
    );

    this.unsubscribeFunctions.push(unsubscribe);
    return unsubscribe;
  }

  // Subscribe to alerts
  subscribeToAlerts(
    deviceId: string,
    callback: (alerts: Alert[]) => void
  ) {
    const q = query(
      collection(db, ALERTS_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const alerts: Alert[] = [];
      querySnapshot.forEach((doc: any) => {
        const alert = doc.data() as Alert;
        if (alert.device_id === deviceId) {
          alerts.push(alert);
        }
      });
      callback(alerts);
    });

    this.unsubscribeFunctions.push(unsubscribe);
    return unsubscribe;
  }

  // Add new sensor data
  async addSensorData(data: Omit<SensorData, 'timestamp'>) {
    try {
      const docRef = await addDoc(collection(db, SENSOR_DATA_COLLECTION), {
        ...data,
        timestamp: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding sensor data:', error);
      throw error;
    }
  }

  // Update device status
  async updateDeviceStatus(deviceId: string, isActive: boolean) {
    try {
      // This would typically update a specific device document
      // Implementation depends on your device management strategy
      console.log(`Device ${deviceId} status updated: ${isActive}`);
    } catch (error) {
      console.error('Error updating device status:', error);
      throw error;
    }
  }

  // Generate alert
  async createAlert(alert: Omit<Alert, 'timestamp'>) {
    try {
      const docRef = await addDoc(collection(db, ALERTS_COLLECTION), {
        ...alert,
        timestamp: serverTimestamp(),
        acknowledged: false,
      });

      // Note: Push notifications are now handled locally via expo-notifications
      // The notificationService.sendAlertNotification() call has been removed

      return docRef.id;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  // Clean up all subscriptions
  cleanup() {
    this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    this.unsubscribeFunctions = [];
  }
}

// Export singleton instance
export const firebaseRealtime = new FirebaseRealtimeService();

// Firebase Cloud Function for IoT data processing
export const processIoTDataFunction = httpsCallable(functions, 'processIoTData');

// Helper functions for data processing
export const processSensorData = (rawData: any): SensorData => {
  return {
    device_id: rawData.device_id,
    temperature: parseFloat(rawData.temperature),
    ph: parseFloat(rawData.ph),
    turbidity: parseFloat(rawData.turbidity),
    ammonia: parseFloat(rawData.ammonia),
    timestamp: serverTimestamp(),
    location: rawData.location,
  };
};

export const checkAlertConditions = (data: SensorData): Alert | null => {
  // Temperature alert
  if (data.temperature < 20 || data.temperature > 30) {
    return {
      device_id: data.device_id,
      type: 'temperature',
      severity: data.temperature < 18 || data.temperature > 32 ? 'critical' : 'high',
      message: `Temperature ${data.temperature}°C is outside normal range (20-30°C)`,
      timestamp: serverTimestamp(),
      acknowledged: false,
    };
  }

  // pH alert
  if (data.ph < 6.0 || data.ph > 8.0) {
    return {
      device_id: data.device_id,
      type: 'ph',
      severity: data.ph < 5.5 || data.ph > 8.5 ? 'critical' : 'high',
      message: `pH level ${data.ph} is outside normal range (6.0-8.0)`,
      timestamp: serverTimestamp(),
      acknowledged: false,
    };
  }

  // Turbidity alert
  if (data.turbidity > 10.0) {
    return {
      device_id: data.device_id,
      type: 'turbidity',
      severity: data.turbidity > 15.0 ? 'critical' : 'medium',
      message: `Turbidity level ${data.turbidity} NTU is above normal (10.0 NTU)`,
      timestamp: serverTimestamp(),
      acknowledged: false,
    };
  }

  // Ammonia alert
  if (data.ammonia > 0.5) {
    return {
      device_id: data.device_id,
      type: 'ammonia',
      severity: data.ammonia > 1.0 ? 'critical' : 'medium',
      message: `Ammonia level ${data.ammonia} ppm is above normal (0.5 ppm)`,
      timestamp: serverTimestamp(),
      acknowledged: false,
    };
  }

  return null;
};
