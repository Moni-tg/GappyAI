// services/iotService.ts
import { httpsCallable } from 'firebase/functions';
import { collection, query, orderBy, limit, onSnapshot, where, addDoc, updateDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, functions, firebaseRealtime, processIoTDataFunction, SensorData, DeviceInfo, Alert } from '../lib/firebase';

export class IoTService {
  private static instance: IoTService;
  private realtimeSubscriptions: Map<string, () => void> = new Map();

  private constructor() {}

  public static getInstance(): IoTService {
    if (!IoTService.instance) {
      IoTService.instance = new IoTService();
    }
    return IoTService.instance;
  }

  // Send IoT data to Firebase (for testing or manual entry)
  async sendSensorData(data: Omit<SensorData, 'timestamp'>) {
    try {
      const result = await processIoTDataFunction(data);
      console.log('Sensor data sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Error sending sensor data:', error);
      throw error;
    }
  }

  // Subscribe to real-time sensor data updates
  subscribeToSensorData(
    deviceId: string,
    callback: (data: SensorData[]) => void,
    maxResults: number = 50
  ) {
    const subscriptionKey = `sensor_${deviceId}`;

    // Unsubscribe from previous subscription if exists
    this.unsubscribe(subscriptionKey);

    const unsubscribe = firebaseRealtime.subscribeToSensorData(deviceId, callback, maxResults);
    this.realtimeSubscriptions.set(subscriptionKey, unsubscribe);

    return () => this.unsubscribe(subscriptionKey);
  }

  // Subscribe to device status updates
  subscribeToDeviceStatus(
    deviceId: string,
    callback: (device: DeviceInfo) => void
  ) {
    const subscriptionKey = `device_${deviceId}`;

    // Unsubscribe from previous subscription if exists
    this.unsubscribe(subscriptionKey);

    const unsubscribe = firebaseRealtime.subscribeToDeviceStatus(deviceId, callback);
    this.realtimeSubscriptions.set(subscriptionKey, unsubscribe);

    return () => this.unsubscribe(subscriptionKey);
  }

  // Subscribe to alerts
  subscribeToAlerts(
    deviceId: string,
    callback: (alerts: Alert[]) => void
  ) {
    const subscriptionKey = `alerts_${deviceId}`;

    // Unsubscribe from previous subscription if exists
    this.unsubscribe(subscriptionKey);

    const unsubscribe = firebaseRealtime.subscribeToAlerts(deviceId, callback);
    this.realtimeSubscriptions.set(subscriptionKey, unsubscribe);

    return () => this.unsubscribe(subscriptionKey);
  }

  // Get latest sensor data
  async getLatestSensorData(deviceId?: string, limitCount: number = 50) {
    try {
      const getLatestData = httpsCallable(functions, 'getLatestSensorData');
      const result = await getLatestData({ device_id: deviceId, limit: limitCount });
      return result.data;
    } catch (error) {
      console.error('Error getting latest sensor data:', error);
      throw error;
    }
  }

  // Register a new IoT device
  async registerDevice(deviceInfo: { device_id: string; name: string; type: string }) {
    try {
      const registerDeviceFunction = httpsCallable(functions, 'registerDevice');
      const result = await registerDeviceFunction(deviceInfo);
      return result.data;
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  // Acknowledge an alert
  async acknowledgeAlert(alertId: string) {
    try {
      const alertRef = doc(db, 'alerts', alertId);
      await updateDoc(alertRef, {
        acknowledged: true,
      });
      console.log('Alert acknowledged successfully');
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  }

  // Get device information
  async getDeviceInfo(deviceId: string) {
    try {
      const deviceRef = doc(db, 'devices', deviceId);
      const deviceSnap = await getDoc(deviceRef);

      if (deviceSnap.exists()) {
        return deviceSnap.data() as DeviceInfo;
      } else {
        throw new Error('Device not found');
      }
    } catch (error) {
      console.error('Error getting device info:', error);
      throw error;
    }
  }

  // Get all devices for the user
  async getAllDevices() {
    try {
      const devicesRef = collection(db, 'devices');
      const snapshot = await getDocs(devicesRef);

      const devices: DeviceInfo[] = [];
      snapshot.forEach((doc: any) => {
        devices.push(doc.data() as DeviceInfo);
      });

      return devices;
    } catch (error) {
      console.error('Error getting all devices:', error);
      throw error;
    }
  }

  // Get historical data for analytics
  async getHistoricalData(deviceId: string, days: number = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const historicalRef = collection(db, 'daily_summaries');
      const q = query(
        historicalRef,
        where('device_id', '==', deviceId),
        where('date', '>=', startDate.toISOString().split('T')[0]),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      const historicalData: any[] = [];

      snapshot.forEach((doc: any) => {
        historicalData.push(doc.data());
      });

      return historicalData;
    } catch (error) {
      console.error('Error getting historical data:', error);
      throw error;
    }
  }

  // Simulate IoT device data (for testing)
  startDataSimulation(deviceId: string, intervalMs: number = 30000) {
    const simulationInterval = setInterval(async () => {
      try {
        // Generate realistic test data
        const testData = {
          device_id: deviceId,
          temperature: 24 + (Math.random() - 0.5) * 4, // 22-26°C
          ph: 7 + (Math.random() - 0.5) * 1, // 6.5-7.5
          turbidity: 3 + Math.random() * 8, // 3-11 NTU
          ammonia: Math.random() * 0.3, // 0-0.3 ppm
          location: 'aquarium_1',
        };

        await this.sendSensorData(testData);
        console.log('Simulated data sent:', testData);
      } catch (error) {
        console.error('Error in data simulation:', error);
      }
    }, intervalMs);

    return () => clearInterval(simulationInterval);
  }

  // Control pump 1 (on/off)
  async controlPump1(deviceId: string, isOn: boolean) {
    try {
      const pumpControlFunction = httpsCallable(functions, 'controlPump');
      const result = await pumpControlFunction({
        device_id: deviceId,
        pump_id: 'pump_1',
        action: isOn ? 'on' : 'off'
      });
      return result.data;
    } catch (error) {
      console.error('Error controlling pump 1:', error);
      throw error;
    }
  }

  // Control pump 2 (on/off)
  async controlPump2(deviceId: string, isOn: boolean) {
    try {
      const pumpControlFunction = httpsCallable(functions, 'controlPump');
      const result = await pumpControlFunction({
        device_id: deviceId,
        pump_id: 'pump_2',
        action: isOn ? 'on' : 'off'
      });
      return result.data;
    } catch (error) {
      console.error('Error controlling pump 2:', error);
      throw error;
    }
  }

  // Get pump status
  async getPumpStatus(deviceId: string) {
    try {
      const pumpStatusFunction = httpsCallable(functions, 'getPumpStatus');
      const result = await pumpStatusFunction({ device_id: deviceId });
      return result.data;
    } catch (error) {
      console.error('Error getting pump status:', error);
      throw error;
    }
  }

  // Private helper method to unsubscribe
  private unsubscribe(subscriptionKey: string) {
    const unsubscribe = this.realtimeSubscriptions.get(subscriptionKey);
    if (unsubscribe) {
      unsubscribe();
      this.realtimeSubscriptions.delete(subscriptionKey);
    }
  }
}

// Export singleton instance
export const iotService = IoTService.getInstance();
