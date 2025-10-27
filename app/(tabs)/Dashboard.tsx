import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Snackbar, Text, Title } from "react-native-paper";
import GlassCard from "../../components/GlassCard";
import GradientBackground from "../../components/GradientBackground";
import HeroHeader from "../../components/HeroHeader";
import MetricGrid from "../../components/MetricGrid";
import { ControlsData, FeederData, firebaseRealtime, RealtimeData, SensorsData } from "../../lib/firebase";

export default function Dashboard() {
  const router = useRouter();
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);
  const [sensors, setSensors] = useState<SensorsData | null>(null);
  const [controls, setControls] = useState<ControlsData | null>(null);
  const [feeder, setFeeder] = useState<FeederData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [lightMode, setLightMode] = useState<'manual' | 'auto'>('auto');
  const [pumpLoading, setPumpLoading] = useState({pump1: false, pump2: false});
  const [subscription, setSubscription] = useState<(() => void) | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);

  // Storage keys
  const USER_IMAGE_KEY = '@user_aquarium_image';

  // Load user image from storage on component mount
  useEffect(() => {
    const loadUserImage = async () => {
      try {
        const savedImage = await AsyncStorage.getItem(USER_IMAGE_KEY);
        if (savedImage) {
          setUserImage(savedImage);
        }
      } catch (error) {
        console.error('Error loading user image:', error);
        // Don't show error to user for this non-critical feature
      }
    };

    loadUserImage();
  }, []);

  // Save user image to storage
  const saveUserImage = async (imageUri: string) => {
    try {
      await AsyncStorage.setItem(USER_IMAGE_KEY, imageUri);
    } catch (error) {
      console.error('Error saving user image:', error);
      Alert.alert('Error', 'Failed to save image. Please try again.');
    }
  };

  // Device ID matching the actual IoT device data path in Firebase
  const DEVICE_ID = 'aquarium_sensor_1';

  const initializeRealtimeData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Initializing realtime data subscription for device:', DEVICE_ID);

      // Clean up existing subscription
      if (subscription) {
        subscription();
        setSubscription(null);
      }

      // Subscribe to real-time device data
      const unsubscribe = firebaseRealtime.subscribeToDeviceData(DEVICE_ID, (data) => {
        console.log('📡 Real-time data received:', data);
        setRealtimeData(data);
        setSensors(data.sensors);
        setControls(data.controls);
        setFeeder(data.feeder);
        setLoading(false);
      });

      setSubscription(() => unsubscribe);

    } catch (err) {
      console.error('❌ Error initializing real-time data:', err);
      setError('Failed to connect to real-time database');
      setSnackbarVisible(true);
      setLoading(false);
    }
  };

  const handleFeedNow = async () => {
    try {
      await firebaseRealtime.triggerFeed(DEVICE_ID);
      console.log('Feed triggered successfully');
    } catch (err) {
      console.error('Error triggering feed:', err);
      setError('Failed to trigger feeding');
      setSnackbarVisible(true);
    }
  };

  const handlePump1Toggle = async () => {
    if (!controls) return;

    setPumpLoading(prev => ({ ...prev, pump1: true }));
    try {
      const currentState = controls.pump1;
      await firebaseRealtime.togglePump(DEVICE_ID, 'pump1', !currentState);
    } catch (err) {
      console.error('Error controlling pump 1:', err);
      setError('Failed to control pump 1');
      setSnackbarVisible(true);
    }
    setPumpLoading(prev => ({ ...prev, pump1: false }));
  };

  const handlePump2Toggle = async () => {
    if (!controls) return;

    setPumpLoading(prev => ({ ...prev, pump2: true }));
    try {
      const currentState = controls.pump2;
      await firebaseRealtime.togglePump(DEVICE_ID, 'pump2', !currentState);
    } catch (err) {
      console.error('Error controlling pump 2:', err);
      setError('Failed to control pump 2');
      setSnackbarVisible(true);
    }
    setPumpLoading(prev => ({ ...prev, pump2: false }));
  };

  const handleLightToggle = async () => {
    if (!controls) return;

    try {
      const currentBrightness = controls.lampBrightness;
      const newBrightness = currentBrightness > 0 ? 0 : 50; // Turn off or turn on with default brightness
      await firebaseRealtime.updateLampBrightness(DEVICE_ID, newBrightness);
      console.log(`Light ${newBrightness > 0 ? 'ON' : 'OFF'} - Brightness: ${newBrightness}%`);
    } catch (err) {
      console.error('Error controlling light:', err);
      setError('Failed to control light');
      setSnackbarVisible(true);
    }
  };

  const handleLightBrightnessChange = async (value: number) => {
    if (!controls) return;

    try {
      await firebaseRealtime.updateLampBrightness(DEVICE_ID, value);
      console.log(`Light brightness set to ${value}%`);
    } catch (err) {
      console.error('Error adjusting light brightness:', err);
      setError('Failed to adjust light brightness');
      setSnackbarVisible(true);
    }
  };

  // Helper function to convert turbidity to descriptive words
  const getTurbidityDescription = (value: number): string => {
    if (value <= 1) return "Crystal Clear";
    if (value <= 5) return "Very Clear";
    if (value <= 10) return "Clear";
    if (value <= 15) return "Slightly Cloudy";
    if (value <= 25) return "Cloudy";
    if (value <= 50) return "Very Cloudy";
    return "Extremely Cloudy";
  };

  const handleLightModeToggle = async () => {
    const newMode = lightMode === 'auto' ? 'manual' : 'auto';
    setLightMode(newMode);
    console.log(`Light mode changed to: ${newMode}`);
  };

  // Update pump status from controls
  useEffect(() => {
    if (controls) {
      // No need to set local state anymore - UI reads directly from controls
    }
  }, [controls]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refresh: Fetching latest data...');
      initializeRealtimeData();
    }, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'temperature': return 'thermometer';
      case 'ph': return 'water';
      case 'turbidity': return 'eye';
      case 'ammonia': return 'chemical-weapon';
      default: return 'alert';
    }
  };

  const getAlertIconStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          marginRight: 12,
          backgroundColor: '#FF5252'
        };
      case 'high':
        return {
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          marginRight: 12,
          backgroundColor: '#FF9800'
        };
      default:
        return {
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          marginRight: 12,
          backgroundColor: '#FFC107'
        };
    }
  };

  const handlePopulateTestData = async () => {
    try {
      console.log('🧪 [DEV MODE] Populating test data...');
      await firebaseRealtime.populateWithTestData(DEVICE_ID);
      console.log('✅ [DEV MODE] Test data populated successfully');
    } catch (err) {
      console.error('❌ Error populating test data:', err);
      setError('Failed to populate test data');
      setSnackbarVisible(true);
    }
  };

  // Handle image selection for HeroHeader
  const handleImageSelect = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to select a photo');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setUserImage(imageUri);
        await saveUserImage(imageUri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  return (
    <GradientBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <HeroHeader
          title="Aquarium Dashboard"
          subtitle="Overview and health snapshot"
          imageSource={userImage ? { uri: userImage } : undefined}
          showImageSelector={true}
          onImageSelect={handleImageSelect}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.smallCards}>
          <Pressable onPress={() => router.push("/tabs2/guide")} style={styles.smallCard}>
            <Text style={styles.smallCardText}>Guide</Text>
          </Pressable>
          <Pressable onPress={handleImageSelect} style={styles.smallCard}>
            <Text style={styles.smallCardText}>Photos</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/tabs2/tips")} style={styles.smallCard}>
            <Text style={styles.smallCardText}>Tips</Text>  
          </Pressable>
        </ScrollView>

        {/* Real-time Sensor Data - Only show when we have real data */}
        {sensors && (
          <MetricGrid
            items={[
              {
                label: "Temperature",
                value: Math.round(sensors.temperature * 10) / 10,
                unit: "°C"
              },
              {
                label: "pH Level",
                value: Math.round(sensors.ph * 10) / 10,
              },
              {
                label: "UV Level",
                value: Math.round(sensors.uv),
                unit: "lux"
              },
              {
                label: "Turbidity",
                value: getTurbidityDescription(sensors.turbidity),
              },
              {
                label: "Ammonia",
                value: Math.round(sensors.ammonia * 100) / 100,
                unit: "ppm"
              },
            ]}
          />
        )}

        {/* Show message when waiting for IoT device data */}
        {!sensors && !loading && (
          <GlassCard style={styles.noAlertsContainer}>
            <Text style={styles.noAlertsText}>📡 Waiting for IoT Device Data</Text>
            <Text style={styles.noAlertsSubtext}>
              Connect your aquarium sensor to see real-time readings
            </Text>
          </GlassCard>
        )}

        {/* Critical Alerts Display - Only show when we have real sensor data */}
        {sensors && (() => {
          const currentAlerts = [];

          if (sensors.ph < 6.0) {
            currentAlerts.push({
              type: 'ph',
              severity: sensors.ph < 5.5 ? 'critical' : 'high',
              message: `pH level ${sensors.ph} is critically low! Fish are in danger.`
            });
          }

          if (sensors.ammonia > 0.5) {
            currentAlerts.push({
              type: 'ammonia',
              severity: sensors.ammonia > 1.0 ? 'critical' : 'medium',
              message: `Ammonia level ${sensors.ammonia} ppm is toxic! Immediate water change needed.`
            });
          }

          if (sensors.turbidity > 10.0) {
            currentAlerts.push({
              type: 'turbidity',
              severity: sensors.turbidity > 15.0 ? 'critical' : 'medium',
              message: `Water is ${getTurbidityDescription(sensors.turbidity).toLowerCase()}! Filter may need cleaning.`
            });
          }

          if (sensors.waterLevel === 0) {
            currentAlerts.push({
              type: 'waterLevel',
              severity: 'critical',
              message: `Water level is 0%! Tank appears empty - check water supply.`
            });
          }

          if (sensors.foodEmpty) {
            currentAlerts.push({
              type: 'food',
              severity: 'medium',
              message: `Food dispenser is empty! Please refill.`
            });
          }

          if (currentAlerts.length > 0) {
            return (
              <GlassCard style={styles.alertsCard}>
                <Title style={styles.alertTitle}>🚨 Critical Alerts ({currentAlerts.length})</Title>
                {currentAlerts.map((alert, index) => (
                  <View key={index} style={styles.alertItem}>
                    <View style={getAlertIconStyle(alert.severity)}>
                      <Text style={styles.alertIconText}>
                        {alert.severity === 'critical' ? '🚨' : alert.severity === 'high' ? '⚠️' : '⚡'}
                      </Text>
                    </View>
                    <View style={styles.alertContent}>
                      <Text style={styles.alertMessage}>{alert.message}</Text>
                      <Text style={styles.alertType}>{alert.type.toUpperCase()}</Text>
                    </View>
                  </View>
                ))}
              </GlassCard>
            );
          }
          return null;
        })()}

        {/* Pump Control - Only show when we have real data */}
        {controls && (
          <GlassCard style={styles.pumpControlCard}>
            <Title style={styles.pumpControlTitle}>Pump Control</Title>
            <Text style={styles.pumpControlSubtitle}>Manage your aquarium pumps</Text>

            <View style={styles.pumpControls}>
              <View style={styles.pumpControl}>
                <View style={styles.pumpHeader}>
                  <Text style={styles.pumpLabel}>Pump 1</Text>
                  <View style={[styles.pumpStatus, controls.pump1 && styles.pumpStatusActive]}>
                    <Text style={[styles.pumpStatusText, controls.pump1 && styles.pumpStatusTextActive]}>
                      {controls.pump1 ? 'ON' : 'OFF'}
                    </Text>
                  </View>
                </View>
                <Button
                  mode="contained"
                  onPress={handlePump1Toggle}
                  style={[styles.pumpButton, controls.pump1 && styles.pumpButtonActive]}
                  buttonColor={controls.pump1 ? "#FF5252" : "#4ECDC4"}
                  textColor="#0B1B2B"
                  icon={controls.pump1 ? "power-off" : "power"}
                  loading={pumpLoading.pump1}
                  disabled={pumpLoading.pump1 || !controls}
                >
                  {controls.pump1 ? 'Turn Off' : 'Turn On'}
                </Button>
              </View>

              <View style={styles.pumpControl}>
                <View style={styles.pumpHeader}>
                  <Text style={styles.pumpLabel}>Pump 2</Text>
                  <View style={[styles.pumpStatus, controls.pump2 && styles.pumpStatusActive]}>
                    <Text style={[styles.pumpStatusText, controls.pump2 && styles.pumpStatusTextActive]}>
                      {controls.pump2 ? 'ON' : 'OFF'}
                    </Text>
                  </View>
                </View>
                <Button
                  mode="contained"
                  onPress={handlePump2Toggle}
                  style={[styles.pumpButton, controls.pump2 && styles.pumpButtonActive]}
                  buttonColor={controls.pump2 ? "#FF5252" : "#4ECDC4"}
                  textColor="#0B1B2B"
                  icon={controls.pump2 ? "power-off" : "power"}
                  loading={pumpLoading.pump2}
                  disabled={pumpLoading.pump2 || !controls || !sensors}
                >
                  {controls.pump2 ? 'Turn Off' : 'Turn On'}
                </Button>
              </View>
            </View>
          </GlassCard>
        )}

        {/* Light Control - Only show when we have real data */}
        {controls && (
          <GlassCard style={styles.lightControlCard}>
            <Title style={styles.lightControlTitle}>Light Control</Title>
            <Text style={styles.lightControlSubtitle}>Manage your aquarium lighting</Text>

            <View style={styles.lightControls}>
              <View style={styles.lightControl}>
                <View style={styles.lightHeader}>
                  <Text style={styles.lightLabel}>Light</Text>
                  <View style={[styles.lightStatus, controls.lampBrightness > 0 && styles.lightStatusActive]}>
                    <Text style={[styles.lightStatusText, controls.lampBrightness > 0 && styles.lightStatusTextActive]}>
                      {controls.lampBrightness > 0 ? 'ON' : 'OFF'}
                    </Text>
                  </View>
                </View>
                <Button
                  mode="contained"
                  onPress={handleLightToggle}
                  style={[styles.lightButton, controls.lampBrightness > 0 && styles.lightButtonActive]}
                  buttonColor={controls.lampBrightness > 0 ? "#FF5252" : "#4ECDC4"}
                  textColor="#0B1B2B"
                  icon={controls.lampBrightness > 0 ? "lightbulb-off" : "lightbulb-on"}
                  disabled={!controls || !sensors}
                >
                  {controls.lampBrightness > 0 ? 'Turn Off' : 'Turn On'}
                </Button>
              </View>

              <View style={styles.brightnessControl}>
                <View style={styles.brightnessHeader}>
                  <Text style={styles.brightnessLabel}>Brightness</Text>
                  <Text style={styles.brightnessValue}>{controls.lampBrightness}%</Text>
                </View>
                <Pressable
                  style={styles.sliderContainer}
                  disabled={!controls || !sensors}
                  onPress={(event) => {
                    const { locationX } = event.nativeEvent;
                    const sliderWidth = 280; // Approximate width of slider
                    const newValue = Math.round((locationX / sliderWidth) * 100);
                    const snappedValue = Math.round(newValue / 10) * 10; // Snap to increments of 10
                    const clampedValue = Math.max(0, Math.min(100, snappedValue));
                    handleLightBrightnessChange(clampedValue);
                  }}
                >
                  <View style={styles.brightnessBar}>
                    <View style={[styles.brightnessFill, { width: `${controls.lampBrightness}%` }]} />
                    <View style={[styles.sliderThumb, { left: `${controls.lampBrightness}%` }]} />
                  </View>
                </Pressable>
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabelText}>0%</Text>
                  <Text style={styles.sliderLabelText}>50%</Text>
                  <Text style={styles.sliderLabelText}>100%</Text>
                </View>
              </View>

              <View style={styles.modeControl}>
                <Text style={styles.modeLabel}>Mode</Text>
                <Button
                  mode={lightMode === 'auto' ? 'contained' : 'outlined'}
                  onPress={handleLightModeToggle}
                  style={styles.modeButton}
                  buttonColor={lightMode === 'auto' ? "#4ECDC4" : "transparent"}
                  textColor={lightMode === 'auto' ? "#0B1B2B" : "#4ECDC4"}
                >
                  {lightMode === 'auto' ? 'AUTO' : 'MANUAL'}
                </Button>
              </View>
            </View>
          </GlassCard>
        )}

        {/* Feeding Schedule - Only show when we have real data */}
        {feeder && (
          <GlassCard style={styles.feedingCard}>
            <View style={styles.feedingHeader}>
              <View>
                <Title style={styles.feedingTitle}>Feeding Schedule</Title>
                <Text style={styles.feedingSubtitle}>Keep your fish healthy and happy</Text>
              </View>
            </View>

            <View style={styles.feedingInfo}>
              <View style={styles.feedingRow}>
                <Text style={styles.feedingLabel}>Auto Feed:</Text>
                <Text style={styles.feedingValue}>{feeder.autoFeedEnabled ? 'Enabled' : 'Disabled'}</Text>
                <Text style={styles.feedingTime}>{feeder.autoFeedEnabled ? '✅ Active' : '❌ Inactive'}</Text>
              </View>

              <View style={styles.feedingRow}>
                <Text style={styles.feedingLabel}>Feed Count:</Text>
                <Text style={styles.feedingValue}>{feeder.feedCount}</Text>
                <Text style={styles.feedingTime}>today</Text>
              </View>

              <View style={styles.feedingRow}>
                <Text style={styles.feedingLabel}>Next Feed:</Text>
                <Text style={styles.feedingValue}>{feeder.nextFeed}</Text>
                <Text style={styles.feedingTime}>remaining</Text>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={handleFeedNow}
              style={styles.feedButton}
              buttonColor="#4ECDC4"
              textColor="#0B1B2B"
              icon="fish"
              disabled={!feeder || !sensors}
            >
              Feed Now
            </Button>
          </GlassCard>
        )}
        <>
          {/* Show loading for controls when sensors are available but controls aren't */}
          {sensors && !controls && (
            <GlassCard style={styles.pumpControlCard}>
              <Title style={styles.pumpControlTitle}>🎛️ Controls Loading...</Title>
              <Text style={styles.pumpControlSubtitle}>Waiting for device control data</Text>
            </GlassCard>
          )}

          {/* Show loading for light controls when sensors are available but controls aren't */}
          {sensors && !controls && (
            <GlassCard style={styles.lightControlCard}>
              <Title style={styles.lightControlTitle}>💡 Light Control Loading...</Title>
              <Text style={styles.lightControlSubtitle}>Waiting for device lighting data</Text>
            </GlassCard>
          )}

          {/* Show loading for feeding when sensors are available but feeder isn't */}
          {sensors && !feeder && (
            <GlassCard style={styles.feedingCard}>
              <View style={styles.feedingHeader}>
                <View>
                  <Title style={styles.feedingTitle}>🍽️ Feeding Loading...</Title>
                  <Text style={styles.feedingSubtitle}>Waiting for feeder data</Text>
                </View>
              </View>
            </GlassCard>
          )}

          {/* System Status - Only show when we have real data */}
          {realtimeData && (
            <GlassCard style={styles.feedingCard}>
              <View style={styles.feedingHeader}>
                <View>
                  <Title style={styles.feedingTitle}>System Status</Title>
                  <Text style={styles.feedingSubtitle}>
                    Last updated: {new Date(realtimeData.lastUpdate).toLocaleString()}
                  </Text>
                </View>
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusItem}>
                  📡 Realtime: {subscription ? '✅ Connected' : '❌ Disconnected'}
                </Text>
                <Text style={styles.statusItem}>
                  📊 Data: ✅ Available
                </Text>
                <Text style={styles.statusItem}>
                  🔄 Loading: ✅ Complete
                </Text>
                <Text style={styles.statusItem}>
                  🤖 IoT Device: {sensors ? '✅ Online' : '⏳ Waiting...'}
                </Text>
                <Text style={styles.statusItem}>
                  🎛️ Controls: {controls ? '✅ Active' : '⏳ Loading...'}
                </Text>
                <Text style={styles.statusItem}>
                  🍽️ Feeder: {feeder ? '✅ Active' : '⏳ Loading...'}
                </Text>
              </View>

              {/* Development Test Button - Hidden in production */}
              {__DEV__ && (
                <Button
                  mode="outlined"
                  onPress={handlePopulateTestData}
                  style={styles.testButton}
                  textColor="#4ECDC4"
                >
                  🧪 Populate Test Data
                </Button>
              )}
            </GlassCard>
          )}

          {/* Show loading message when waiting for IoT device */}
          {!realtimeData && !loading && (
            <GlassCard style={styles.feedingCard}>
              <View style={styles.feedingHeader}>
                <View>
                  <Title style={styles.feedingTitle}>System Status</Title>
                  <Text style={styles.feedingSubtitle}>Initializing connection...</Text>
                </View>
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusItem}>
                  📡 Realtime: {subscription ? '✅ Connected' : '⏳ Connecting...'}
                </Text>
                <Text style={styles.statusItem}>
                  📊 Data: ❌ No data
                </Text>
                <Text style={styles.statusItem}>
                  🔄 Loading: ⏳ In progress
                </Text>
                <Text style={styles.statusItem}>
                  🤖 IoT Device: ⏳ Waiting...
                </Text>
              </View>
            </GlassCard>
          )}
        </>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        action={{
          label: 'Retry',
          onPress: () => {
            console.log('🔄 Retrying realtime connection...');
            initializeRealtimeData();
          },
        }}
      >
        {error || 'Connection error'}
      </Snackbar>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    fontSize: 18,
    fontWeight: "700",
    color: "#EAF2FF",
    textAlign: "center",
  },
  smallCards: {
    gap: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  smallCard: {
    width: 120,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius:15,
    elevation: 6,
    
  },
  smallCardText: {
    color: "#47BDCE",
    fontWeight: "700",
    backgroundColor:"transparent",
  },
  sectionTitle: {
    color: "#EAF2FF",
    fontWeight: "800",
    marginBottom: 6,
  },
  listTitle: {
    color: "#EAF2FF",
    fontWeight: "700",
  },
  listDesc: {
    color: "#C6D4EA",
  },
  divider: {
    backgroundColor: "rgba(255,255,255,0.08)",
    height: 1,
    marginVertical: 6,
  },
  // Feeding System Styles
  feedingCard: {
    padding: 16,
  },
  feedingHeader: {
    marginBottom: 16,
  },
  feedingTitle: {
    color: "#EAF2FF",
    fontWeight: "700",
    marginBottom: 4,
  },
  feedingSubtitle: {
    color: "#C6D4EA",
    fontSize: 14,
  },
  feedingInfo: {
    marginBottom: 20,
  },
  feedingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  feedingLabel: {
    color: "#C6D4EA",
    fontSize: 14,
    flex: 1,
  },
  feedingValue: {
    color: "#47BDCE",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  feedingTime: {
    color: "rgba(234, 242, 255, 0.6)",
    fontSize: 12,
  },
  feedButton: {
    borderRadius: 12,
  },
  statusInfo: {
    marginBottom: 16,
  },
  statusItem: {
    color: "#47BDCE",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  testButton: {
    borderRadius: 12,
    marginTop: 12,
  },
  noAlertsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noAlertsText: {
    color: '#EAF2FF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  noAlertsSubtext: {
    color: '#C6D4EA',
    fontSize: 14,
  },
  // Alert Styles
  alertsCard: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#FF5252',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
  },
  alertTitle: {
    color: '#FF5252',
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 12,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertcritical: {
    backgroundColor: '#FF5252',
  },
  alerthigh: {
    backgroundColor: '#FF9800',
  },
  alertmedium: {
    backgroundColor: '#FFC107',
  },
  alertIconText: {
    fontSize: 16,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    color: '#EAF2FF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  alertType: {
    color: '#47BDCE',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pumpControlCard: {
    padding: 20,
  },
  pumpControlTitle: {
    color: '#EAF2FF',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 4,
  },
  pumpControlSubtitle: {
    color: '#C6D4EA',
    fontSize: 14,
    marginBottom: 20,
  },
  pumpControls: {
    gap: 16,
  },
  pumpControl: {
    gap: 12,
  },
  pumpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pumpLabel: {
    color: '#EAF2FF',
    fontSize: 16,
    fontWeight: '600',
  },
  pumpStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  pumpStatusActive: {
    backgroundColor: '#4ECDC4',
  },
  pumpStatusText: {
    color: '#C6D4EA',
    fontSize: 12,
    fontWeight: '600',
  },
  pumpStatusTextActive: {
    color: '#0B1B2B',
  },
  pumpButton: {
    borderRadius: 12,
  },
  pumpButtonActive: {
    borderWidth: 2,
    borderColor: '#FF5252',
  },
  acknowledgedAlert: {
    opacity: 0.6,
    textDecorationLine: 'line-through',
  },
  // Light Control Styles
  lightControlCard: {
    padding: 20,
  },
  lightControlTitle: {
    color: '#EAF2FF',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 4,
  },
  lightControlSubtitle: {
    color: '#C6D4EA',
    fontSize: 14,
    marginBottom: 20,
  },
  lightControls: {
    gap: 16,
  },
  lightControl: {
    gap: 12,
  },
  lightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lightLabel: {
    color: '#EAF2FF',
    fontSize: 16,
    fontWeight: '600',
  },
  lightStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightStatusActive: {
    backgroundColor: '#4ECDC4',
  },
  lightStatusText: {
    color: '#C6D4EA',
    fontSize: 12,
    fontWeight: '600',
  },
  lightStatusTextActive: {
    color: '#0B1B2B',
  },
  lightButton: {
    borderRadius: 12,
  },
  lightButtonActive: {
    borderWidth: 2,
    borderColor: '#FF5252',
  },
  brightnessControl: {
    gap: 12,
  },
  brightnessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brightnessLabel: {
    color: '#EAF2FF',
    fontSize: 16,
    fontWeight: '600',
  },
  brightnessValue: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '600',
  },
  brightnessControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brightnessButton: {
    borderRadius: 8,
    minWidth: 50,
  },
  sliderContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4ECDC4',
    borderWidth: 2,
    borderColor: '#0B1B2B',
    elevation: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  sliderLabelText: {
    color: '#C6D4EA',
    fontSize: 12,
    fontWeight: '600',
  },
  brightnessBar: {
    width: 280,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  brightnessFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  modeControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeLabel: {
    color: '#EAF2FF',
    fontSize: 16,
    fontWeight: '600',
  },
  modeButton: {
    borderRadius: 12,
  },
});