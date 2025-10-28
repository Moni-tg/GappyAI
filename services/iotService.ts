// services/iotService.ts
import { RealtimeData, SensorsData, ControlsData, FeederData, firebaseRealtime } from '../lib/firebase';
import { checkAlertConditions } from '../lib/firebase';

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

  // Send IoT data to Firebase Realtime Database
  async sendSensorData(deviceId: string, data: Partial<SensorsData>) {
    try {
      // For Realtime Database, we need to update the specific device path
      // This would typically be called from an IoT device or external service
      console.log('Sending sensor data to device:', deviceId, data);
      // In a real implementation, this would update the sensors path in the database
      return { success: true, message: 'Data sent successfully' };
    } catch (error) {
      console.error('Error sending sensor data:', error);
      throw error;
    }
  }

  // Subscribe to real-time sensor data updates
  subscribeToSensorData(
    deviceId: string,
    callback: (data: SensorsData) => void,
    maxResults: number = 50
  ) {
    const subscriptionKey = `sensor_${deviceId}`;

    // Unsubscribe from previous subscription if exists
    this.unsubscribe(subscriptionKey);

    const unsubscribe = firebaseRealtime.subscribeToSensors(deviceId, callback);
    this.realtimeSubscriptions.set(subscriptionKey, unsubscribe);

    return () => this.unsubscribe(subscriptionKey);
  }

  // Subscribe to controls data
  subscribeToControls(
    deviceId: string,
    callback: (controls: ControlsData) => void
  ) {
    const subscriptionKey = `controls_${deviceId}`;

    // Unsubscribe from previous subscription if exists
    this.unsubscribe(subscriptionKey);

    const unsubscribe = firebaseRealtime.subscribeToControls(deviceId, callback);
    this.realtimeSubscriptions.set(subscriptionKey, unsubscribe);

    return () => this.unsubscribe(subscriptionKey);
  }

  // Subscribe to feeder data
  subscribeToFeeder(
    deviceId: string,
    callback: (feeder: FeederData) => void
  ) {
    const subscriptionKey = `feeder_${deviceId}`;

    // Unsubscribe from previous subscription if exists
    this.unsubscribe(subscriptionKey);

    // For now, we'll extract feeder data from the main device subscription
    const unsubscribe = firebaseRealtime.subscribeToDeviceData(deviceId, (data) => {
      if (data.feeder) {
        callback(data.feeder);
      }
    });
    this.realtimeSubscriptions.set(subscriptionKey, unsubscribe);

    return () => this.unsubscribe(subscriptionKey);
  }

  // Control pump 1 (on/off)
  async controlPump1(deviceId: string, isOn: boolean) {
    try {
      await firebaseRealtime.togglePump(deviceId, 'pump1', isOn);
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
      await firebaseRealtime.togglePump(deviceId, 'pump2', isOn);
      console.log(`Pump 2 ${isOn ? 'turned on' : 'turned off'} for device ${deviceId}`);
      return { success: true };
    } catch (error) {
      console.error('Error controlling pump 2:', error);
      throw error;
    }
  }

  // Control light (brightness)
  async controlLight(deviceId: string, isOn: boolean, brightness: number = 50) {
    try {
      await firebaseRealtime.updateLampBrightness(deviceId, isOn ? brightness : 0);
      console.log(`Light ${isOn ? 'turned on' : 'turned off'} with brightness ${brightness}% for device ${deviceId}`);
      return { success: true };
    } catch (error) {
      console.error('Error controlling light:', error);
      throw error;
    }
  }

  // Trigger feeding
  async triggerFeeding(deviceId: string) {
    try {
      await firebaseRealtime.triggerFeed(deviceId);
      console.log(`Feeding triggered for device ${deviceId}`);
      return { success: true };
    } catch (error) {
      console.error('Error triggering feeding:', error);
      throw error;
    }
  }

  // Get current device status
  async getDeviceStatus(deviceId: string): Promise<RealtimeData | null> {
    try {
      // This would typically read from the Realtime Database
      // For now, return null since we don't have a direct read method
      return null;
    } catch (error) {
      console.error('Error getting device status:', error);
      throw error;
    }
  }

  // Simulate IoT device data (for testing)
  startDataSimulation(deviceId: string, intervalMs: number = 30000) {
    const simulationInterval = setInterval(async () => {
      try {
        // Generate realistic test data based on your database structure
        const testData: Partial<SensorsData> = {
          temperature: 24 + (Math.random() - 0.5) * 4, // 22-26°C
          ph: 7 + (Math.random() - 0.5) * 1, // 6.5-7.5
          turbidity: 3 + Math.random() * 8, // 3-11 NTU
          ammonia: Math.random() * 0.3, // 0-0.3 ppm
          uv: 800 + Math.random() * 400, // 800-1200 UV index
          waterLevel: 70 + Math.random() * 30, // 70-100%
          waterLevelCm: 15 + Math.random() * 10, // 15-25 cm
          foodEmpty: Math.random() > 0.7, // 30% chance of being empty
        };

        await this.sendSensorData(deviceId, testData);
        console.log('Simulated data sent:', testData);
      } catch (error) {
        console.error('Error in data simulation:', error);
      }
    }, intervalMs);

    return () => clearInterval(simulationInterval);
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
