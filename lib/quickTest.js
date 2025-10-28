// lib/quickTest.js
// Quick test script to run in browser console
// Copy and paste this into your browser console when the app is running

// Test Firebase connection
import { firebaseRealtime } from './firebase.ts';

console.log('🧪 Testing Firebase connection...');

// Test 1: Try to populate test data
try {
  await firebaseRealtime.populateWithTestData('aquarium_sensor_1');
  console.log('✅ Test data populated successfully');
} catch (error) {
  console.error('❌ Failed to populate test data:', error);
}

// Test 2: Set up subscription
const unsubscribe = firebaseRealtime.subscribeToDeviceData('aquarium_sensor_1', (data) => {
  console.log('📡 Real-time data received:', data);
  console.log('✅ Realtime subscription working!');
});

// Test 3: Update some values to trigger changes
setTimeout(async () => {
  try {
    await firebaseRealtime.updateLampBrightness('aquarium_sensor_1', 100);
    await firebaseRealtime.togglePump('aquarium_sensor_1', 'pump1', true);
    console.log('✅ Control updates sent successfully');
  } catch (error) {
    console.error('❌ Control update failed:', error);
  }
}, 1000);

// Clean up after 10 seconds
setTimeout(() => {
  unsubscribe();
  console.log('🧹 Subscription cleaned up');
}, 10000);
