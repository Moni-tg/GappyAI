import { Alert } from 'react-native';
import { Alert as FirebaseAlert } from '../lib/firebase';
import { notificationService } from './notificationService';

/**
 * Test utilities for notification service
 * These functions help test various aspects of the notification system
 */

export class NotificationTestUtils {

  /**
   * Test notification permissions
   */
  static async testPermissions(): Promise<{
    hasPermission: boolean;
    token: string | null;
    error?: string;
  }> {
    try {
      console.log('🧪 Testing notification permissions...');

      // Check current permission status
      const hasPermission = await notificationService.areNotificationsEnabled();
      console.log(`📱 Permission status: ${hasPermission ? 'GRANTED' : 'DENIED'}`);

      // Request permissions if needed
      if (!hasPermission) {
        console.log('🔄 Requesting permissions...');
        const permissionGranted = await notificationService.requestPermissions();
        console.log(`✅ Permission request result: ${permissionGranted ? 'GRANTED' : 'DENIED'}`);
      }

      // Get FCM token
      console.log('🔑 Getting FCM token...');
      const token = await notificationService.getToken();

      if (token) {
        console.log(`✅ FCM Token obtained: ${token.substring(0, 50)}...`);
      } else {
        console.log('❌ Failed to get FCM token');
      }

      return {
        hasPermission: await notificationService.areNotificationsEnabled(),
        token,
      };
    } catch (error) {
      console.error('❌ Error testing permissions:', error);
      return {
        hasPermission: false,
        token: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test topic subscriptions
   */
  static async testSubscriptions(): Promise<{
    generalAlerts: boolean;
    deviceAlerts: boolean;
    error?: string;
  }> {
    try {
      console.log('🧪 Testing topic subscriptions...');

      // Subscribe to general alerts
      console.log('📢 Subscribing to general alerts...');
      await notificationService.subscribeToGeneralAlerts();
      console.log('✅ Subscribed to general alerts');

      // Subscribe to a test device
      const testDeviceId = 'test_device_001';
      console.log(`📱 Subscribing to device ${testDeviceId}...`);
      await notificationService.subscribeToDevice(testDeviceId);
      console.log(`✅ Subscribed to device ${testDeviceId}`);

      // Unsubscribe from device
      console.log(`🔄 Unsubscribing from device ${testDeviceId}...`);
      await notificationService.unsubscribeFromDevice(testDeviceId);
      console.log(`✅ Unsubscribed from device ${testDeviceId}`);

      return {
        generalAlerts: true,
        deviceAlerts: true,
      };
    } catch (error) {
      console.error('❌ Error testing subscriptions:', error);
      return {
        generalAlerts: false,
        deviceAlerts: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test alert notification creation
   */
  static async testAlertNotification(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('🧪 Testing alert notification creation...');

      // Create a test alert
      const testAlert: FirebaseAlert = {
        device_id: 'test_device_001',
        type: 'temperature',
        severity: 'critical',
        message: 'Test notification: Temperature is too high!',
        timestamp: new Date(),
        acknowledged: false,
      };

      console.log('🚨 Sending test alert notification...');
      await notificationService.sendAlertNotification(testAlert);
      console.log('✅ Test alert notification sent');

      return { success: true };
    } catch (error) {
      console.error('❌ Error testing alert notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test complete notification flow
   */
  static async runFullNotificationTest(): Promise<{
    permissions: boolean;
    subscriptions: boolean;
    alertNotification: boolean;
    errors: string[];
  }> {
    console.log('🚀 Starting comprehensive notification test...');

    const errors: string[] = [];

    // Test 1: Permissions
    const permissionResult = await this.testPermissions();
    if (!permissionResult.hasPermission || !permissionResult.token) {
      errors.push('Permission/Token test failed');
    }

    // Test 2: Subscriptions
    const subscriptionResult = await this.testSubscriptions();
    if (!subscriptionResult.generalAlerts || !subscriptionResult.deviceAlerts) {
      errors.push('Subscription test failed');
    }

    // Test 3: Alert notification
    const alertResult = await this.testAlertNotification();
    if (!alertResult.success) {
      errors.push('Alert notification test failed');
    }

    const success = errors.length === 0;

    console.log(`🧪 Test completed: ${success ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    if (errors.length > 0) {
      console.log('❌ Errors:', errors);
    }

    return {
      permissions: permissionResult.hasPermission && !!permissionResult.token,
      subscriptions: subscriptionResult.generalAlerts && subscriptionResult.deviceAlerts,
      alertNotification: alertResult.success,
      errors,
    };
  }

  /**
   * Show test results in an alert dialog (for React Native)
   */
  static showTestResults(results: {
    permissions: boolean;
    subscriptions: boolean;
    alertNotification: boolean;
    errors: string[];
  }): void {
    const message = `
🧪 NOTIFICATION TEST RESULTS

✅ Permissions: ${results.permissions ? 'PASSED' : 'FAILED'}
✅ Subscriptions: ${results.subscriptions ? 'PASSED' : 'FAILED'}
✅ Alert Notification: ${results.alertNotification ? 'PASSED' : 'FAILED'}

${results.errors.length > 0 ? `❌ Errors:\n${results.errors.join('\n')}` : '🎉 All tests passed!'}
    `.trim();

    Alert.alert(
      'Notification Test Results',
      message,
      [{ text: 'OK' }]
    );
  }
}

// Export singleton instance
export const notificationTestUtils = NotificationTestUtils;
