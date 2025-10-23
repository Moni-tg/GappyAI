# Firebase Console Testing Guide

## 📱 Manual Testing with Firebase Console

This guide explains how to test push notifications using the Firebase Console.

### Prerequisites
1. ✅ Firebase project set up
2. ✅ React Native Firebase configured
3. ✅ App running on device/emulator
4. ✅ FCM token obtained (run the test utils first)

### Step 1: Get Your FCM Token
1. Run your app on a device/emulator
2. Open browser console or use the test utilities
3. Call `notificationService.getToken()` to get your FCM token
4. Copy the token (it should look like: `fcm-token-here...`)

### Step 2: Send Test Notification via Firebase Console

#### 2.1 Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Engage** → **Cloud Messaging**

#### 2.2 Compose Test Message
1. Click **"Send your first message"** or **"New notification"**
2. Choose **"Firebase Notification messages"**
3. Fill in the notification details:

```json
{
  "title": "Test Notification",
  "body": "This is a test notification from Firebase Console"
}
```

#### 2.3 Target Specific Device (Recommended)
1. In the **"Target"** section, select **"Single device"**
2. Paste your FCM token in the **"Add FCM registration token"** field
3. Click **"Test"**

#### 2.4 Alternative: Test with Topic (if subscribed)
1. In the **"Target"** section, select **"Topic"**
2. Enter topic name: `general_alerts` (if you subscribed to it)
3. Click **"Test"**

### Step 3: Test Different Scenarios

#### 3.1 Foreground Notification
1. Keep your app open and in foreground
2. Send notification from Firebase Console
3. ✅ Should see notification appear as in-app notification
4. ✅ Check console logs for "Foreground message received"

#### 3.2 Background Notification
1. Put app in background (press home button)
2. Send notification from Firebase Console
3. ✅ Should see notification in device notification tray
4. ✅ Check console logs for "Background message received"

#### 3.3 Notification Tap (Quit State)
1. Force quit the app completely
2. Send notification from Firebase Console
3. Tap the notification when it arrives
4. ✅ App should open and handle the notification
5. ✅ Check console logs for "App opened from notification"

### Step 4: Test Alert Notifications

#### 4.1 Test Device-Specific Alert
1. Subscribe to a device topic (e.g., `device_test_device_001`)
2. Send notification with custom data:

```json
{
  "title": "Aquarium Alert - CRITICAL",
  "body": "Temperature is too high!",
  "data": {
    "type": "alert",
    "device_id": "test_device_001",
    "alert_type": "temperature",
    "severity": "critical"
  }
}
```

#### 4.2 Test Different Severities
- **Info**: Low priority notification
- **Warning**: Medium priority
- **Critical**: High priority (requires special iOS setup)

### Step 5: Troubleshooting

#### Common Issues

**❌ Notification not received**
- Check if FCM token is valid and not expired
- Verify app is properly configured with Firebase
- Check device/emulator supports push notifications
- Ensure internet connection

**❌ Permission denied**
- Check if notification permissions are granted
- For iOS: Go to Settings → Notifications → Your App
- For Android: Check app permissions

**❌ Console shows "Message sent" but no notification**
- Verify the FCM token is correct
- Check if the device is online
- Ensure the app is properly registered with Firebase

**❌ iOS notifications not working**
- Check if push notifications capability is enabled in Xcode
- Verify APNs certificates are configured
- Check if device is properly registered for notifications

#### Debug Information to Collect
1. FCM Token
2. Firebase project configuration
3. Device/emulator type and OS version
4. Console logs when notification is sent
5. Network connectivity

### Step 6: Advanced Testing

#### 6.1 Test with Firebase Functions (if implemented)
If you have Firebase Cloud Functions set up for sending notifications:

```javascript
// Example function call
const { getFunctions, httpsCallable } = require('firebase/functions');
const functions = getFunctions();
const sendNotification = httpsCallable(functions, 'sendNotification');

await sendNotification({
  token: 'your-fcm-token',
  title: 'Function Test',
  body: 'Notification sent via Cloud Function'
});
```

#### 6.2 Test Notification Scheduling
- Use Firebase Console to schedule notifications
- Test different delivery times
- Verify notifications arrive at scheduled time

### Quick Test Commands

For quick testing, you can run these in your app:

```typescript
// Test permissions and token
await notificationTestUtils.testPermissions();

// Test subscriptions
await notificationTestUtils.testSubscriptions();

// Test alert notification
await notificationTestUtils.testAlertNotification();

// Run full test suite
const results = await notificationTestUtils.runFullNotificationTest();
notificationTestUtils.showTestResults(results);
```

---

**🎯 Pro Tips:**
- Always test on real devices for accurate results
- Use different Firebase projects for development/staging
- Monitor Firebase Console analytics to track delivery rates
- Test with both WiFi and mobile data
- Clear app data and test fresh installs
