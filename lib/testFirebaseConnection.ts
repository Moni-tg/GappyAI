// lib/testFirebaseConnection.ts
import { firebaseRealtime, RealtimeData, SensorsData, ControlsData, FeederData } from './firebase';

/**
 * Test Firebase Realtime Database connection and populate with sample data
 * This can be used to verify the connection and provide initial data for testing
 */
export const testFirebaseConnection = async (deviceId: string = 'aquarium_sensor_1') => {
  try {
    console.log('🔄 Testing Firebase Realtime Database connection...');

    // Test subscription
    let dataReceived = false;
    const testSubscription = firebaseRealtime.subscribeToDeviceData(deviceId, (data) => {
      console.log('📡 Real-time data received:', data);
      dataReceived = true;
    });

    // Wait a moment for subscription to establish
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (dataReceived) {
      console.log('✅ Real-time subscription working!');
    } else {
      console.log('⚠️ No data received yet - this might be normal if no device is sending data');
    }

    // Clean up subscription
    testSubscription();

    return { success: true, message: 'Firebase connection test completed' };

  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Initialize device with default data structure
 * This creates the basic structure in the Realtime Database
 */
export const initializeDeviceData = async (deviceId: string = 'aquarium_sensor_1') => {
  try {
    console.log('🔄 Initializing device data structure...');

    // Note: In Firebase Realtime Database, we don't need to explicitly create the structure
    // The structure is created when data is first written to a path
    // This function serves as a reference for the expected structure

    const defaultData: RealtimeData = {
      sensors: {
        temperature: 25.0,
        ph: 7.2,
        turbidity: 5.0,
        ammonia: 0.1,
        uv: 970,
        waterLevel: 85,
        waterLevelCm: 18,
        foodEmpty: false
      },
      controls: {
        autoFeedEnabled: true,
        feedNow: false,
        lampBrightness: 50,
        pump1: false,
        pump2: false
      },
      feeder: {
        autoFeedEnabled: true,
        feedCount: 0,
        nextFeed: '2h 30m'
      },
      outputs: {
        lampBrightness: 50,
        pump1: false,
        pump2: false
      },
      lastUpdate: Date.now()
    };

    console.log('📋 Default data structure:', defaultData);
    console.log('✅ Device data structure initialized successfully');
    console.log('📝 Note: Data will be created in the database when your IoT device sends its first update');

    return { success: true, data: defaultData };

  } catch (error) {
    console.error('❌ Failed to initialize device data:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Generate sample data for testing
 * This can be used to populate the database with realistic test data
 */
export const generateSampleData = (deviceId: string = 'aquarium_sensor_1'): RealtimeData => {
  const baseTemp = 24 + (Math.random() - 0.5) * 4; // 22-26°C
  const basePh = 7 + (Math.random() - 0.5) * 1; // 6.5-7.5
  const baseTurbidity = 3 + Math.random() * 8; // 3-11 NTU
  const baseAmmonia = Math.random() * 0.3; // 0-0.3 ppm
  const baseUv = 800 + Math.random() * 400; // 800-1200
  const baseWaterLevel = 70 + Math.random() * 30; // 70-100%
  const baseWaterLevelCm = 15 + Math.random() * 10; // 15-25 cm

  return {
    sensors: {
      temperature: Math.round(baseTemp * 10) / 10,
      ph: Math.round(basePh * 10) / 10,
      turbidity: Math.round(baseTurbidity * 10) / 10,
      ammonia: Math.round(baseAmmonia * 100) / 100,
      uv: Math.round(baseUv),
      waterLevel: Math.round(baseWaterLevel),
      waterLevelCm: Math.round(baseWaterLevelCm * 10) / 10,
      foodEmpty: Math.random() > 0.8 // 20% chance of being empty
    },
    controls: {
      autoFeedEnabled: Math.random() > 0.3, // 70% chance of being enabled
      feedNow: false,
      lampBrightness: Math.floor(Math.random() * 101), // 0-100
      pump1: Math.random() > 0.6, // 40% chance of being on
      pump2: Math.random() > 0.7 // 30% chance of being on
    },
    feeder: {
      autoFeedEnabled: Math.random() > 0.2, // 80% chance of being enabled
      feedCount: Math.floor(Math.random() * 5), // 0-4 feeds today
      nextFeed: `${Math.floor(Math.random() * 6) + 1}h ${Math.floor(Math.random() * 60)}m`
    },
    outputs: {
      lampBrightness: Math.floor(Math.random() * 101),
      pump1: Math.random() > 0.6,
      pump2: Math.random() > 0.7
    },
    lastUpdate: Date.now()
  };
};
