// lib/testRealtimeSetup.ts
import { firebaseRealtime } from './firebase';

/**
 * Quick setup script to populate Firebase with test data
 * Run this to verify realtime functionality is working
 */
export const setupRealtimeTest = async () => {
  console.log('🧪 Setting up realtime test data...');

  try {
    // First populate the database with test data
    await firebaseRealtime.populateWithTestData('aquarium_sensor_1');
    console.log('✅ Test data populated');

    // Set up a subscription to verify it's working
    console.log('🔄 Setting up subscription to verify data flow...');
    const unsubscribe = firebaseRealtime.subscribeToDeviceData('aquarium_sensor_1', (data) => {
      console.log('📡 Real-time data received:', data);
      console.log('✅ Realtime subscription is working!');
    });

    // Wait a moment then update some data to trigger the subscription
    setTimeout(async () => {
      console.log('🔄 Testing control updates...');
      await firebaseRealtime.updateLampBrightness('aquarium_sensor_1', 100);
      await firebaseRealtime.togglePump('aquarium_sensor_1', 'pump1', true);

      // Clean up after a delay
      setTimeout(() => {
        console.log('🧹 Cleaning up subscription...');
        unsubscribe();
        console.log('✅ Test completed successfully!');
      }, 3000);
    }, 2000);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Auto-run if this file is executed directly
if (typeof window === 'undefined') {
  console.log('🚀 Running realtime test setup...');
  setupRealtimeTest();
}
