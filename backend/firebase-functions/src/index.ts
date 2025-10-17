// src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Types for IoT data
interface IoTSensorData {
  device_id: string;
  temperature: number;
  ph: number;
  oxygen: number;
  ammonia: number;
  timestamp?: FirebaseFirestore.FieldValue;
  location?: string;
}

interface AlertData {
  device_id: string;
  type: 'temperature' | 'ph' | 'oxygen' | 'ammonia' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp?: FirebaseFirestore.FieldValue;
  acknowledged: boolean;
}

// HTTP endpoint for IoT devices to send data
export const processIoTData = functions.https.onCall(async (data: IoTSensorData, context) => {
  try {
    // Validate the data
    if (!data.device_id || !data.temperature || !data.ph || !data.oxygen || !data.ammonia) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required sensor data fields'
      );
    }

    // Create sensor data document
    const sensorData: IoTSensorData = {
      device_id: data.device_id,
      temperature: Number(data.temperature),
      ph: Number(data.ph),
      oxygen: Number(data.oxygen),
      ammonia: Number(data.ammonia),
      location: data.location || 'default',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Store sensor data in Firestore
    const docRef = await db.collection('sensor_data').add(sensorData);

    // Update device last seen timestamp
    await db.collection('devices').doc(data.device_id).set({
      device_id: data.device_id,
      last_seen: admin.firestore.FieldValue.serverTimestamp(),
      is_active: true,
    }, { merge: true });

    // Check for alert conditions
    await checkAndCreateAlerts(sensorData);

    // Store historical data for analytics (optional)
    await storeHistoricalData(sensorData);

    console.log(`Processed IoT data for device ${data.device_id}`);

    return {
      success: true,
      documentId: docRef.id,
      timestamp: sensorData.timestamp,
    };

  } catch (error) {
    console.error('Error processing IoT data:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to process IoT data'
    );
  }
});

// Function to check alert conditions and create alerts
async function checkAndCreateAlerts(sensorData: IoTSensorData) {
  const alerts: AlertData[] = [];

  // Temperature alerts
  if (sensorData.temperature < 20 || sensorData.temperature > 30) {
    alerts.push({
      device_id: sensorData.device_id,
      type: 'temperature',
      severity: sensorData.temperature < 18 || sensorData.temperature > 32 ? 'critical' : 'high',
      message: `Temperature ${sensorData.temperature}°C is outside normal range (20-30°C)`,
      acknowledged: false,
    });
  }

  // pH alerts
  if (sensorData.ph < 6.0 || sensorData.ph > 8.0) {
    alerts.push({
      device_id: sensorData.device_id,
      type: 'ph',
      severity: sensorData.ph < 5.5 || sensorData.ph > 8.5 ? 'critical' : 'high',
      message: `pH level ${sensorData.ph} is outside normal range (6.0-8.0)`,
      acknowledged: false,
    });
  }

  // Oxygen alerts
  if (sensorData.oxygen < 5.0) {
    alerts.push({
      device_id: sensorData.device_id,
      type: 'oxygen',
      severity: sensorData.oxygen < 3.0 ? 'critical' : 'medium',
      message: `Oxygen level ${sensorData.oxygen} mg/L is below normal (5.0+ mg/L)`,
      acknowledged: false,
    });
  }

  // Ammonia alerts
  if (sensorData.ammonia > 0.5) {
    alerts.push({
      device_id: sensorData.device_id,
      type: 'ammonia',
      severity: sensorData.ammonia > 1.0 ? 'critical' : 'medium',
      message: `Ammonia level ${sensorData.ammonia} ppm is above normal (0.5 ppm)`,
      acknowledged: false,
    });
  }

  // Create alerts in Firestore
  for (const alert of alerts) {
    await db.collection('alerts').add({
      ...alert,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  if (alerts.length > 0) {
    console.log(`Created ${alerts.length} alerts for device ${sensorData.device_id}`);
  }
}

// Store historical data for analytics (runs daily)
export const storeHistoricalData = functions.pubsub
  .schedule('0 0 * * *') // Daily at midnight
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Get all sensor data from the last 24 hours
      const snapshot = await db
        .collection('sensor_data')
        .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(yesterday))
        .get();

      if (snapshot.empty) {
        console.log('No sensor data found for historical storage');
        return null;
      }

      // Group data by device and calculate daily averages
      const deviceData = new Map<string, any[]>();

      snapshot.forEach((doc) => {
        const data = doc.data();
        const deviceId = data.device_id;

        if (!deviceData.has(deviceId)) {
          deviceData.set(deviceId, []);
        }
        deviceData.get(deviceId)!.push(data);
      });

      // Calculate and store daily summaries
      for (const [deviceId, readings] of deviceData.entries()) {
        const dailySummary = calculateDailySummary(readings);

        await db.collection('daily_summaries').add({
          device_id: deviceId,
          date: yesterday.toISOString().split('T')[0],
          ...dailySummary,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      console.log(`Stored historical data for ${deviceData.size} devices`);
      return null;

    } catch (error) {
      console.error('Error storing historical data:', error);
      return null;
    }
  });

// Calculate daily summary statistics
function calculateDailySummary(readings: any[]) {
  const temperatures = readings.map(r => r.temperature).filter(t => !isNaN(t));
  const phValues = readings.map(r => r.ph).filter(p => !isNaN(p));
  const oxygenValues = readings.map(r => r.oxygen).filter(o => !isNaN(o));
  const ammoniaValues = readings.map(r => r.ammonia).filter(a => !isNaN(a));

  return {
    avg_temperature: temperatures.length > 0 ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length : 0,
    min_temperature: temperatures.length > 0 ? Math.min(...temperatures) : 0,
    max_temperature: temperatures.length > 0 ? Math.max(...temperatures) : 0,
    avg_ph: phValues.length > 0 ? phValues.reduce((a, b) => a + b, 0) / phValues.length : 0,
    min_ph: phValues.length > 0 ? Math.min(...phValues) : 0,
    max_ph: phValues.length > 0 ? Math.max(...phValues) : 0,
    avg_oxygen: oxygenValues.length > 0 ? oxygenValues.reduce((a, b) => a + b, 0) / oxygenValues.length : 0,
    min_oxygen: oxygenValues.length > 0 ? Math.min(...oxygenValues) : 0,
    max_oxygen: oxygenValues.length > 0 ? Math.max(...oxygenValues) : 0,
    avg_ammonia: ammoniaValues.length > 0 ? ammoniaValues.reduce((a, b) => a + b, 0) / ammoniaValues.length : 0,
    max_ammonia: ammoniaValues.length > 0 ? Math.max(...ammoniaValues) : 0,
    reading_count: readings.length,
  };
}

// HTTP endpoint for devices to register
export const registerDevice = functions.https.onCall(async (data: { device_id: string; name: string; type: string }, context) => {
  try {
    if (!data.device_id || !data.name || !data.type) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required device registration fields'
      );
    }

    // Check if device already exists
    const deviceDoc = await db.collection('devices').doc(data.device_id).get();

    if (deviceDoc.exists) {
      // Update existing device
      await db.collection('devices').doc(data.device_id).update({
        name: data.name,
        type: data.type,
        last_seen: admin.firestore.FieldValue.serverTimestamp(),
        is_active: true,
      });
    } else {
      // Create new device
      await db.collection('devices').doc(data.device_id).set({
        device_id: data.device_id,
        name: data.name,
        type: data.type,
        is_active: true,
        registered_at: admin.firestore.FieldValue.serverTimestamp(),
        last_seen: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    console.log(`Device ${data.device_id} registered/updated successfully`);
    return { success: true };

  } catch (error) {
    console.error('Error registering device:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to register device'
    );
  }
});

// HTTP endpoint to get latest sensor data
export const getLatestSensorData = functions.https.onCall(async (data: { device_id?: string; limit?: number }, context) => {
  try {
    let query = db.collection('sensor_data')
      .orderBy('timestamp', 'desc')
      .limit(data.limit || 50);

    if (data.device_id) {
      // For specific device, we'd need a composite query or store in subcollections
      // For now, we'll get all and filter client-side
      query = query.where('device_id', '==', data.device_id);
    }

    const snapshot = await query.get();
    const sensorData: any[] = [];

    snapshot.forEach((doc) => {
      sensorData.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: sensorData,
    };

  } catch (error) {
    console.error('Error getting sensor data:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get sensor data'
    );
  }
});
