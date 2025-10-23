// backend/firebase-functions/functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Send notification when a new alert is created
export const sendAlertNotification = functions.firestore
  .document('alerts/{alertId}')
  .onCreate(async (snap, context) => {
    const alert = snap.data();

    if (!alert) return;

    // Create notification payload
    const payload = {
      notification: {
        title: `Aquarium Alert - ${alert.severity?.toUpperCase() || 'MEDIUM'}`,
        body: alert.message || 'A new alert has been generated',
        icon: 'ic_notification',
        color: getColorForSeverity(alert.severity),
        sound: 'default',
        badge: '1',
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      data: {
        alert_id: context.params.alertId,
        device_id: alert.device_id || '',
        alert_type: alert.type || '',
        severity: alert.severity || 'medium',
        timestamp: new Date().toISOString(),
      },
    };

    try {
      // Send to device-specific topic
      const deviceTopic = `device_${alert.device_id}`;
      await admin.messaging().sendToTopic(deviceTopic, payload);

      // Send to general alerts topic for all users
      await admin.messaging().sendToTopic('general_alerts', payload);

      // Send to critical alerts topic if severity is critical
      if (alert.severity === 'critical') {
        await admin.messaging().sendToTopic('critical_alerts', payload);
      }

      console.log(`Alert notification sent for device: ${alert.device_id}`);
    } catch (error) {
      console.error('Error sending alert notification:', error);
    }
  });

// Helper function to get color based on severity
function getColorForSeverity(severity: string): string {
  switch (severity) {
    case 'critical':
      return '#d32f2f';
    case 'high':
      return '#f57c00';
    case 'medium':
      return '#fbc02d';
    case 'low':
      return '#388e3c';
    default:
      return '#47BDCE';
  }
}

// HTTP endpoint for testing notifications (optional)
export const testNotification = functions.https.onCall(async (data, context) => {
  const { deviceId, title, body } = data;

  if (!deviceId || !title || !body) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required parameters: deviceId, title, body'
    );
  }

  const payload = {
    notification: {
      title,
      body,
      icon: 'ic_notification',
      color: '#47BDCE',
    },
    data: {
      device_id: deviceId,
      test: 'true',
    },
  };

  try {
    const topic = `device_${deviceId}`;
    await admin.messaging().sendToTopic(topic, payload);
    return { success: true, topic };
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send notification');
  }
});

// Function to register device tokens (when users install the app)
export const registerDeviceToken = functions.https.onCall(async (data, context) => {
  const { token, deviceId } = data;

  if (!token || !deviceId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required parameters: token, deviceId'
    );
  }

  try {
    // Save token to Firestore for targeted messaging
    await admin.firestore().collection('device_tokens').doc(token).set({
      device_id: deviceId,
      token: token,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Subscribe to device-specific topic
    await admin.messaging().subscribeToTopic([token], `device_${deviceId}`);

    return { success: true };
  } catch (error) {
    console.error('Error registering device token:', error);
    throw new functions.https.HttpsError('internal', 'Failed to register token');
  }
});
