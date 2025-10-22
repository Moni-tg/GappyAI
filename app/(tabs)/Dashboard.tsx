import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Divider, List, Snackbar, Text, Title } from "react-native-paper";
import GlassCard from "../../components/GlassCard";
import GradientBackground from "../../components/GradientBackground";
import HeroHeader from "../../components/HeroHeader";
import MetricGrid from "../../components/MetricGrid";
import { Alert as AlertType, SensorData } from "../../lib/firebase";
import { iotService } from "../../services/iotService";

export default function Dashboard() {
  const router = useRouter();
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [pump1Status, setPump1Status] = useState(false);
  const [pump2Status, setPump2Status] = useState(false);
  const [pumpLoading, setPumpLoading] = useState({pump1: false, pump2: false});
  const [lastFeeding, setLastFeeding] = useState(new Date());
  const [nextFeeding, setNextFeeding] = useState(new Date(Date.now() + 6 * 60 * 60 * 1000)); // Next feeding in 6 hours
  const [lightBrightness, setLightBrightness] = useState(50);
  const [lightMode, setLightMode] = useState<'manual' | 'auto'>('auto');
  const [lightStatus, setLightStatus] = useState(false);

  // Default device ID - in a real app, this would come from user preferences or device selection
  const DEVICE_ID = 'aquarium_sensor_001';

  const initializeIoTData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Register device if it doesn't exist (for demo purposes)
      try {
        await iotService.registerDevice({
          device_id: DEVICE_ID,
          name: 'Aquarium Sensor 001',
          type: 'aquarium_sensor'
        });
      } catch (err) {
        console.log('Device registration error (may already exist):', err);
      }

      // Subscribe to real-time sensor data
      iotService.subscribeToSensorData(DEVICE_ID, (data) => {
        setSensorData(data);
        setLoading(false);
      });

      // Subscribe to alerts
      iotService.subscribeToAlerts(DEVICE_ID, (alertData) => {
        setAlerts(alertData);
      });

      // Start data simulation for demo (remove in production)
      const stopSimulation = iotService.startDataSimulation(DEVICE_ID, 5000); // Every 5 seconds for demo

      // Store cleanup function
      (initializeIoTData as any).stopSimulation = stopSimulation;

    } catch (err) {
      console.error('Error initializing IoT data:', err);
      setError('Failed to connect to IoT sensors');
      setSnackbarVisible(true);
      setLoading(false);
    }
  };

  const handleFeedNow = () => {
    const now = new Date();
    setLastFeeding(now);
    setNextFeeding(new Date(now.getTime() + 6 * 60 * 60 * 1000)); // Next feeding in 6 hours
  };

  const handlePump1Toggle = async () => {
    setPumpLoading(prev => ({ ...prev, pump1: true }));
    try {
      await iotService.controlPump1(DEVICE_ID, !pump1Status);
      setPump1Status(!pump1Status);
    } catch (err) {
      console.error('Error controlling pump 1:', err);
      setError('Failed to control pump 1');
      setSnackbarVisible(true);
    }
    setPumpLoading(prev => ({ ...prev, pump1: false }));
  };

  const handlePump2Toggle = async () => {
    setPumpLoading(prev => ({ ...prev, pump2: true }));
    try {
      await iotService.controlPump2(DEVICE_ID, !pump2Status);
      setPump2Status(!pump2Status);
    } catch (err) {
      console.error('Error controlling pump 2:', err);
      setError('Failed to control pump 2');
      setSnackbarVisible(true);
    }
    setPumpLoading(prev => ({ ...prev, pump2: false }));
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await iotService.acknowledgeAlert(alertId);
      // Update local state
      setAlerts(prev => prev.map(alert =>
        alert.timestamp ? { ...alert, acknowledged: true } : alert
      ));
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      setError('Failed to acknowledge alert');
      setSnackbarVisible(true);
    }
  };

  const handleLightToggle = async () => {
    try {
      // TODO: Implement light control in iotService
      // await iotService.controlLight(DEVICE_ID, !lightStatus, lightBrightness);
      setLightStatus(!lightStatus);
      console.log(`Light ${!lightStatus ? 'ON' : 'OFF'} - Brightness: ${lightBrightness}%`);
    } catch (err) {
      console.error('Error controlling light:', err);
      setError('Failed to control light');
      setSnackbarVisible(true);
    }
  };

  const handleLightBrightnessChange = async (value: number) => {
    setLightBrightness(value);
    if (lightMode === 'manual' && lightStatus) {
      try {
        // TODO: Implement light brightness control in iotService
        // await iotService.controlLight(DEVICE_ID, true, value);
        console.log(`Light brightness set to ${value}%`);
      } catch (err) {
        console.error('Error adjusting light brightness:', err);
        setError('Failed to adjust light brightness');
        setSnackbarVisible(true);
      }
    }
  };

  const handleLightModeToggle = async () => {
    const newMode = lightMode === 'manual' ? 'auto' : 'manual';
    setLightMode(newMode);
    try {
      // TODO: Implement light mode control in iotService
      // await iotService.setLightMode(DEVICE_ID, newMode);
      console.log(`Light mode changed to ${newMode}`);
    } catch (err) {
      console.error('Error changing light mode:', err);
      setError('Failed to change light mode');
      setSnackbarVisible(true);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get latest sensor values for display
  const latestData = sensorData[0] || {
    temperature: 24.5,
    ph: 7.2,
    turbidity: 5.0,
    ammonia: 0.1,
    waterLevel: 85  // Added water level percentage
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'temperature': return 'thermometer';
      case 'ph': return 'water';
      case 'turbidity': return 'eye';
      case 'ammonia': return 'chemical-weapon';
      default: return 'alert';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#FF5252';
      case 'high': return '#FF9800';
      case 'medium': return '#FFC107';
      default: return '#4CAF50';
    }
  };

  return (
    <GradientBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <HeroHeader
          title="Aquarium Dashboard"
          subtitle="Overview and health snapshot"
          
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.smallCards}>
          <Pressable onPress={() => router.push("/tabs2/guide")} style={styles.smallCard}>
            <Text style={styles.smallCardText}>Guide</Text>
          </Pressable>
          <Pressable style={styles.smallCard}>
            <Text style={styles.smallCardText}>Photos</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/tabs2/tips")} style={styles.smallCard}>
            <Text style={styles.smallCardText}>Tips</Text>  
          </Pressable>
        </ScrollView>

        {/* Real-time Sensor Data */}
        <MetricGrid
          items={[
            {
              label: "Temperature",
              value: Math.round(latestData.temperature * 10) / 10,
              unit: "°C"
            },
            {
              label: "pH Level",
              value: Math.round(latestData.ph * 10) / 10,
            },
            {
              label: "Turbidity",
              value: Math.round(latestData.turbidity * 10) / 10,
              unit: "NTU"
            },
            {
              label: "Ammonia",
              value: Math.round(latestData.ammonia * 100) / 100,
              unit: "ppm"
            },
          ]}
        />

        {/* Water Level - Full Width */}
        <GlassCard style={styles.waterLevelCard}>
          <View style={styles.waterLevelHeader}>
            <Title style={styles.waterLevelTitle}>Water Level</Title>
            <Text style={styles.waterLevelPercentage}>{latestData.waterLevel}%</Text>
          </View>
          <View style={styles.waterLevelBar}>
            <View style={[styles.waterLevelFill, { width: `${Math.min((latestData.waterLevel || 0), 100)}%` }]} />
          </View>
          <Text style={styles.waterLevelStatus}>
            {(latestData.waterLevel || 0) >= 80 ? 'Optimal Level' :
             (latestData.waterLevel || 0) >= 60 ? 'Good Level' :
             (latestData.waterLevel || 0) >= 40 ? 'Low Level' : 'Critical Level'}
          </Text>
        </GlassCard>

        {/* Pump Control - Full Width */}
        <GlassCard style={styles.pumpControlCard}>
          <Title style={styles.pumpControlTitle}>Pump Control</Title>
          <Text style={styles.pumpControlSubtitle}>Manage your aquarium pumps</Text>

          <View style={styles.pumpControls}>
            <View style={styles.pumpControl}>
              <View style={styles.pumpHeader}>
                <Text style={styles.pumpLabel}>Pump 1</Text>
                <View style={[styles.pumpStatus, pump1Status && styles.pumpStatusActive]}>
                  <Text style={[styles.pumpStatusText, pump1Status && styles.pumpStatusTextActive]}>
                    {pump1Status ? 'ON' : 'OFF'}
                  </Text>
                </View>
              </View>
              <Button
                mode="contained"
                onPress={handlePump1Toggle}
                style={[styles.pumpButton, pump1Status && styles.pumpButtonActive]}
                buttonColor={pump1Status ? "#FF5252" : "#4ECDC4"}
                textColor="#0B1B2B"
                icon={pump1Status ? "power-off" : "power"}
                loading={pumpLoading.pump1}
                disabled={pumpLoading.pump1}
              >
                {pump1Status ? 'Turn Off' : 'Turn On'}
              </Button>
            </View>

            <View style={styles.pumpControl}>
              <View style={styles.pumpHeader}>
                <Text style={styles.pumpLabel}>Pump 2</Text>
                <View style={[styles.pumpStatus, pump2Status && styles.pumpStatusActive]}>
                  <Text style={[styles.pumpStatusText, pump2Status && styles.pumpStatusTextActive]}>
                    {pump2Status ? 'ON' : 'OFF'}
                  </Text>
                </View>
              </View>
              <Button
                mode="contained"
                onPress={handlePump2Toggle}
                style={[styles.pumpButton, pump2Status && styles.pumpButtonActive]}
                buttonColor={pump2Status ? "#FF5252" : "#4ECDC4"}
                textColor="#0B1B2B"
                icon={pump2Status ? "power-off" : "power"}
                loading={pumpLoading.pump2}
                disabled={pumpLoading.pump2}
              >
                {pump2Status ? 'Turn Off' : 'Turn On'}
              </Button>
            </View>
          </View>
        </GlassCard>

        {/* Light Control - Full Width */}
        <GlassCard style={styles.lightControlCard}>
          <Title style={styles.lightControlTitle}>Light Control</Title>
          <Text style={styles.lightControlSubtitle}>Manage your aquarium lighting</Text>

          <View style={styles.lightControls}>
            <View style={styles.lightControl}>
              <View style={styles.lightHeader}>
                <Text style={styles.lightLabel}>Light</Text>
                <View style={[styles.lightStatus, lightStatus && styles.lightStatusActive]}>
                  <Text style={[styles.lightStatusText, lightStatus && styles.lightStatusTextActive]}>
                    {lightStatus ? 'ON' : 'OFF'}
                  </Text>
                </View>
              </View>
              <Button
                mode="contained"
                onPress={handleLightToggle}
                style={[styles.lightButton, lightStatus && styles.lightButtonActive]}
                buttonColor={lightStatus ? "#FF5252" : "#4ECDC4"}
                textColor="#0B1B2B"
                icon={lightStatus ? "lightbulb-off" : "lightbulb-on"}
              >
                {lightStatus ? 'Turn Off' : 'Turn On'}
              </Button>
            </View>

            <View style={styles.brightnessControl}>
              <View style={styles.brightnessHeader}>
                <Text style={styles.brightnessLabel}>Brightness</Text>
                <Text style={styles.brightnessValue}>{lightBrightness}%</Text>
              </View>
              <View style={styles.brightnessControls}>
                <Button
                  mode="outlined"
                  onPress={() => handleLightBrightnessChange(Math.max(0, lightBrightness - 10))}
                  style={styles.brightnessButton}
                  textColor="#4ECDC4"
                  disabled={lightBrightness <= 0}
                >
                  -10
                </Button>
                <View style={styles.brightnessBar}>
                  <View style={[styles.brightnessFill, { width: `${lightBrightness}%` }]} />
                </View>
                <Button
                  mode="outlined"
                  onPress={() => handleLightBrightnessChange(Math.min(100, lightBrightness + 10))}
                  style={styles.brightnessButton}
                  textColor="#4ECDC4"
                  disabled={lightBrightness >= 100}
                >
                  +10
                </Button>
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

        <GlassCard style={styles.feedingCard}>
          <View style={styles.feedingHeader}>
            <View>
              <Title style={styles.feedingTitle}>Feeding Schedule</Title>
              <Text style={styles.feedingSubtitle}>Keep your fish healthy and happy</Text>
            </View>
          </View>

          <View style={styles.feedingInfo}>
            <View style={styles.feedingRow}>
              <Text style={styles.feedingLabel}>Last Fed:</Text>
              <Text style={styles.feedingValue}>{formatTime(lastFeeding)}</Text>
              <Text style={styles.feedingTime}>{formatDate(lastFeeding)}</Text>
            </View>

            <View style={styles.feedingRow}>
              <Text style={styles.feedingLabel}>Next Feeding:</Text>
              <Text style={styles.feedingValue}>{formatTime(nextFeeding)}</Text>
              <Text style={styles.feedingTime}>in {Math.floor((nextFeeding.getTime() - Date.now()) / (1000 * 60 * 60))}h</Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleFeedNow}
            style={styles.feedButton}
            buttonColor="#4ECDC4"
            textColor="#0B1B2B"
            icon="fish"
          >
            Feed Now
          </Button>
        </GlassCard>

        <GlassCard style={styles.alertsCard}>
          <Title style={styles.sectionTitle}>
            Recent Alerts {alerts.length > 0 && `(${alerts.length})`}
          </Title>

          {alerts.length === 0 ? (
            <View style={styles.noAlertsContainer}>
              <Text style={styles.noAlertsText}>No recent alerts</Text>
              <Text style={styles.noAlertsSubtext}>Your aquarium is running smoothly</Text>
            </View>
          ) : (
            alerts.slice(0, 5).map((alert, index) => (
              <View key={index}>
                <List.Item
                  title={alert.message}
                  description={`Severity: ${alert.severity} • ${new Date(alert.timestamp?.toDate()).toLocaleString()}`}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      color={getAlertColor(alert.severity)}
                      icon={getAlertIcon(alert.type)}
                    />
                  )}
                  right={(props) => !alert.acknowledged ? (
                    <Button
                      {...props}
                      mode="text"
                      compact
                      onPress={() => handleAcknowledgeAlert(index.toString())}
                      textColor="#4ECDC4"
                    >
                      Ack
                    </Button>
                  ) : null}
                  titleStyle={[
                    styles.listTitle,
                    alert.acknowledged && styles.acknowledgedAlert
                  ]}
                  descriptionStyle={styles.listDesc}
                />
                {index < alerts.slice(0, 5).length - 1 && <Divider style={styles.divider} />}
              </View>
            ))
          )}
        </GlassCard>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        action={{
          label: 'Retry',
          onPress: initializeIoTData,
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
    borderRadius:15,
    backgroundColor:"transparent",
  },
  alertsCard: {
    padding: 12,
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
  // Water Level Card Styles
  waterLevelCard: {
    padding: 20,
  },
  waterLevelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  waterLevelTitle: {
    color: '#EAF2FF',
    fontWeight: '700',
    fontSize: 18,
  },
  waterLevelPercentage: {
    color: '#4ECDC4',
    fontWeight: '800',
    fontSize: 24,
  },
  waterLevelBar: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  waterLevelFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 6,
  },
  waterLevelStatus: {
    color: '#CFE2FF',
    fontSize: 14,
    textAlign: 'left',
    fontWeight: '600',
  },
  // Pump Control Styles
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
  brightnessBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
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