// context/NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationService } from '../services/notificationService';

interface NotificationContextType {
  notificationsEnabled: boolean;
  criticalAlertsEnabled: boolean;
  temperatureAlertsEnabled: boolean;
  phAlertsEnabled: boolean;
  turbidityAlertsEnabled: boolean;
  ammoniaAlertsEnabled: boolean;
  requestPermissions: () => Promise<boolean>;
  subscribeToDevice: (deviceId: string) => Promise<void>;
  unsubscribeFromDevice: (deviceId: string) => Promise<void>;
  getToken: () => Promise<string | null>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [criticalAlertsEnabled, setCriticalAlertsEnabled] = useState(true);
  const [temperatureAlertsEnabled, setTemperatureAlertsEnabled] = useState(true);
  const [phAlertsEnabled, setPhAlertsEnabled] = useState(true);
  const [turbidityAlertsEnabled, setTurbidityAlertsEnabled] = useState(true);
  const [ammoniaAlertsEnabled, setAmmoniaAlertsEnabled] = useState(true);

  // Initialize notification settings
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        const enabled = await notificationService.areNotificationsEnabled();
        setNotificationsEnabled(enabled);

        // Load saved preferences from AsyncStorage or similar
        // For now, we'll use default values
      } catch (error) {
        console.error('Error initializing notification settings:', error);
      }
    };

    initializeSettings();
  }, []);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const granted = await notificationService.requestPermissions();
      setNotificationsEnabled(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const subscribeToDevice = async (deviceId: string): Promise<void> => {
    try {
      await notificationService.subscribeToDevice(deviceId);
    } catch (error) {
      console.error('Error subscribing to device:', error);
    }
  };

  const unsubscribeFromDevice = async (deviceId: string): Promise<void> => {
    try {
      await notificationService.unsubscribeFromDevice(deviceId);
    } catch (error) {
      console.error('Error unsubscribing from device:', error);
    }
  };

  const getToken = async (): Promise<string | null> => {
    try {
      return await notificationService.getToken();
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  const contextValue: NotificationContextType = {
    notificationsEnabled,
    criticalAlertsEnabled,
    temperatureAlertsEnabled,
    phAlertsEnabled,
    turbidityAlertsEnabled,
    ammoniaAlertsEnabled,
    requestPermissions,
    subscribeToDevice,
    unsubscribeFromDevice,
    getToken,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
