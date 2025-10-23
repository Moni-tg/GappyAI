// services/notificationService.ts
import * as Notifications from 'expo-notifications';
import { Alert } from '../lib/firebase';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPayload {
  title: string;
  body: string;
  data?: { [key: string]: string };
  type?: 'alert' | 'info' | 'warning';
}

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize local notifications
  async initialize() {
    try {
      // Request permission for notifications
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permission denied');
        return;
      }

      console.log('Notification permission granted');

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Handle notification received while app is in foreground
      Notifications.addNotificationReceivedListener(notification => {
        console.log('Foreground notification received:', notification);
        this.handleNotificationReceived(notification);
      });

      // Handle notification tapped
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification tapped:', response);
        this.handleNotificationResponse(response);
      });

    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Schedule a local notification
  async scheduleNotification(title: string, body: string, data?: any, delaySeconds: number = 0) {
    try {
      const trigger: Notifications.TimeIntervalTriggerInput | null = delaySeconds > 0
        ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delaySeconds }
        : null;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
        },
        trigger,
      });

      console.log('Notification scheduled:', { title, body, delaySeconds });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Display immediate local notification
  private async displayNotification(notificationPayload: NotificationPayload) {
    try {
      await this.scheduleNotification(
        notificationPayload.title,
        notificationPayload.body,
        notificationPayload.data
      );
      console.log('Notification displayed:', notificationPayload);
    } catch (error) {
      console.error('Error displaying notification:', error);
    }
  }

  // Handle notification received in foreground
  private handleNotificationReceived(notification: Notifications.Notification) {
    const { title, body, data } = notification.request.content;

    if (title && body) {
      console.log('Handling foreground notification:', { title, body, data });

      // You can add custom logic here, like showing an in-app notification
      this.showInAppNotification(title, body, data);
    }
  }

  // Handle notification tapped
  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    const { data } = response.notification.request.content;

    if (data?.type === 'alert') {
      console.log('Opening app from alert notification');
      // You can dispatch navigation actions here
    }
  }

  // Show in-app notification (for foreground notifications)
  private showInAppNotification(title: string, body: string, data?: any) {
    // Implement in-app notification display logic
    // You could use a toast library or custom notification component
    console.log('In-app notification:', { title, body, data });
  }

  // Send notification for alert (to be called when a new alert is created)
  async sendAlertNotification(alert: Alert) {
    try {
      const notification: NotificationPayload = {
        title: `Aquarium Alert - ${alert.severity.toUpperCase()}`,
        body: alert.message,
        data: {
          type: 'alert',
          device_id: alert.device_id,
          alert_type: alert.type,
          severity: alert.severity,
        },
        type: alert.severity === 'critical' ? 'warning' : 'info',
      };

      // For local notifications, we display them immediately
      await this.displayNotification(notification);

    } catch (error) {
      console.error('Error sending alert notification:', error);
    }
  }

  // Subscribe to device notifications (no-op for local notifications)
  async subscribeToDevice(deviceId: string) {
    console.log(`Local notifications don't require subscription for device: ${deviceId}`);
  }

  // Unsubscribe from device notifications (no-op for local notifications)
  async unsubscribeFromDevice(deviceId: string) {
    console.log(`Local notifications don't require unsubscription for device: ${deviceId}`);
  }

  // Subscribe to general alerts (no-op for local notifications)
  async subscribeToGeneralAlerts() {
    console.log('Local notifications are always available for general alerts');
  }

  // Get notification token (no-op for local notifications)
  async getToken(): Promise<string | null> {
    console.log('Local notifications don\'t use tokens');
    return null;
  }

  // Check if notifications are enabled
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All scheduled notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
