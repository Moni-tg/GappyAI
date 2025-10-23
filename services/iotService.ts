// services/iotService.ts
import { collection, query, orderBy, limit, onSnapshot, where, addDoc, updateDoc, doc, getDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, firebaseRealtime, processSensorData, checkAlertConditions, SensorData, DeviceInfo, Alert, SENSOR_DATA_COLLECTION, ALERTS_COLLECTION } from '../lib/firebase';

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
      // Process the sensor data using client-side logic
      const processedData = processSensorData(data);

      // Save to Firestore directly
      const docRef = await addDoc(collection(db, SENSOR_DATA_COLLECTION), processedData);

      // Check for alert conditions
      const alert = checkAlertConditions(processedData);
      if (alert) {
        await addDoc(collection(db, ALERTS_COLLECTION), alert);
        console.log('Alert created:', alert);
      }

      console.log('Sensor data sent successfully:', docRef.id);
      return { success: true, id: docRef.id };
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
      let q;
      if (deviceId) {
        q = query(
          collection(db, SENSOR_DATA_COLLECTION),
          where('device_id', '==', deviceId),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
      } else {
        q = query(
          collection(db, SENSOR_DATA_COLLECTION),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
      }

      const snapshot = await getDocs(q);
      const data: SensorData[] = [];

      snapshot.forEach((doc: any) => {
        data.push(doc.data() as SensorData);
      });

      return data;
    } catch (error) {
      console.error('Error getting latest sensor data:', error);
      throw error;
    }
  }

  // Register a new IoT device
  async registerDevice(deviceInfo: { device_id: string; name: string; type: string }) {
    try {
      const deviceData = {
        ...deviceInfo,
        is_active: true,
        last_seen: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'devices'), deviceData);
      console.log('Device registered successfully:', docRef.id);
      return { success: true, id: docRef.id };
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
      const commandData = {
        device_id: deviceId,
        pump_id: 'pump_1',
        action: isOn ? 'on' : 'off',
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, 'device_commands'), commandData);
      console.log(`Pump 1 ${isOn ? 'turned on' : 'turned off'} for device ${deviceId}`);
      return { success: true };
    } catch (error) {
      console.error('Error controlling pump 1:', error);
      throw error;
    }
  }

  // Control pump 2 (on/off)
  async controlPump2(deviceId: string, isOn: boolean) {
    try {
      const commandData = {
        device_id: deviceId,
        pump_id: 'pump_2',
        action: isOn ? 'on' : 'off',
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, 'device_commands'), commandData);
      console.log(`Pump 2 ${isOn ? 'turned on' : 'turned off'} for device ${deviceId}`);
      return { success: true };
    } catch (error) {
      console.error('Error controlling pump 2:', error);
      throw error;
    }
  }

  // Get pump status
  async getPumpStatus(deviceId: string) {
    try {
      const q = query(
        collection(db, 'device_commands'),
        where('device_id', '==', deviceId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const commands: any[] = [];

      snapshot.forEach((doc: any) => {
        commands.push(doc.data());
      });

      // Return the latest command for each pump
      const latestCommands: { [key: string]: any } = {};
      commands.forEach(cmd => {
        if (!latestCommands[cmd.pump_id] || cmd.timestamp > latestCommands[cmd.pump_id].timestamp) {
          latestCommands[cmd.pump_id] = cmd;
        }
      });

      return latestCommands;
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
