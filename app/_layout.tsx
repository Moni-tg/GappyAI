import { Stack, useRouter, useSegments } from "expo-router";
import { useLayoutEffect, useEffect } from "react";
import LoadingScreen from "../components/LoadingScreen";
import { AuthProvider, useAuth } from "../context/authprov";
import { IotProvider } from "../context/iotprov";
import { notificationService } from "../services/notificationService";
import { NotificationProvider } from "../context/NotificationContext";

const InitialLayout = () => {
  // Destructure the 'user' object instead of 'isAuthenticated'
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useLayoutEffect(() => {
    // If authentication status is still loading, do nothing
    if (isLoading) return;

    // Check if the current route is part of the 'auth' group
    const isAuthRoute = segments[0] === 'auth';

    // Check for the user object to determine if the user is authenticated
    if (!user && !isAuthRoute) {
      router.replace("/auth");
    } 
    // If the user object exists and the route is an auth route, redirect to the main app tabs.
    else if (user && isAuthRoute) {
      console.log('[Nav] Redirect -> / (user present, on auth route)');
      router.replace("/(tabs)/Dashboard");
    } else {
      console.log('[Nav] No redirect needed.');
    }
  }, [user, isLoading, segments, router]); // 'user' is now in the dependency array

  // Initialize notifications when app starts
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await notificationService.initialize();
        console.log('Notifications initialized successfully');
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initializeNotifications();
  }, []);

  if (isLoading) {
    return <LoadingScreen />; 
  }
  
  // Conditionally render the correct navigator based on the app's state.
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="tabs2" options={{ headerShown: false }} />
    </Stack>
    
  );
};

export default function RootLayout() {
  return (
    <NotificationProvider>
      <IotProvider>
        <AuthProvider>
          <InitialLayout />
        </AuthProvider>
      </IotProvider>
    </NotificationProvider>
  );
}
