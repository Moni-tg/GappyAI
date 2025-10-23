import { useRouter } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { Divider, IconButton, List, Text, Title } from "react-native-paper";
import GlassCard from "../../components/GlassCard";
import GradientBackground from "../../components/GradientBackground";
import HeroHeader from "../../components/HeroHeader";

export default function GuideScreen() {
  const router = useRouter();
  return (
    <GradientBackground>
      <IconButton
        icon="arrow-left"
        iconColor="#FFFFFF"
        size={28}
        onPress={() => router.back()}
        style={styles.backButton}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <HeroHeader title="App User Guide" subtitle="How to use your aquarium monitor" />

        <GlassCard style={styles.card}>
          <Title style={styles.sectionTitle}>Dashboard Overview</Title>
          <Text style={styles.text}>
            The main dashboard shows real-time sensor data from your aquarium. You'll see:
          </Text>
          <Text style={styles.text}>• Temperature, pH, turbidity, and ammonia levels</Text>
          <Text style={styles.text}>• Water level percentage and status</Text>
          <Text style={styles.text}>• Feeding schedule with next feeding time</Text>
          <Text style={styles.text}>• Recent alerts and system notifications</Text>
          <Text style={styles.text}>• Quick access to Guide, Photos, and Tips</Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Title style={styles.sectionTitle}>Understanding Sensor Data</Title>
          <List.Item
            title="Temperature"
            description="Optimal range: 20-30°C. Critical if outside 18-32°C"
            titleStyle={styles.itemTitle}
            descriptionStyle={styles.itemDesc}
            left={(p) => <List.Icon {...p} color="#8BDCE0" icon="thermometer" />}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="pH Level"
            description="Optimal range: 6.0-8.0. Most fish prefer 6.5-7.5"
            titleStyle={styles.itemTitle}
            descriptionStyle={styles.itemDesc}
            left={(p) => <List.Icon {...p} color="#8BDCE0" icon="water" />}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Turbidity"
            description="Water clarity in NTU. Optimal: <10 NTU. >15 NTU is critical"
            titleStyle={styles.itemTitle}
            descriptionStyle={styles.itemDesc}
            left={(p) => <List.Icon {...p} color="#8BDCE0" icon="eye" />}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Ammonia"
            description="Should be 0 ppm. Any reading >0.5 ppm requires immediate attention"
            titleStyle={styles.itemTitle}
            descriptionStyle={styles.itemDesc}
            left={(p) => <List.Icon {...p} color="#8BDCE0" icon="chemical-weapon" />}
          />
        </GlassCard>

        <GlassCard style={styles.card}>
          <Title style={styles.sectionTitle}>Alert System</Title>
          <Text style={styles.text}>
            The app monitors your aquarium 24/7 and sends alerts for:
          </Text>
          <Text style={styles.text}>• Critical parameter deviations</Text>
          <Text style={styles.text}>• System malfunctions</Text>
          <Text style={styles.text}>• Maintenance reminders</Text>
          <Text style={styles.text}>• Feeding schedule notifications</Text>
          <Text style={styles.text}>Color-coded severity levels:</Text>
          <Text style={[styles.text, { color: "#FF5252" }]}>• Red: Critical - immediate action required</Text>
          <Text style={[styles.text, { color: "#FF9800" }]}>• Orange: High - check within hours</Text>
          <Text style={[styles.text, { color: "#FFC107" }]}>• Yellow: Medium - monitor closely</Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Title style={styles.sectionTitle}>Settings & Customization</Title>
          <Text style={styles.text}>
            Customize your experience in Settings:
          </Text>
          <Text style={styles.text}>• Enable/disable push notifications</Text>
          <Text style={styles.text}>• Set up critical alerts only</Text>
          <Text style={styles.text}>• Configure temperature, pH, turbidity, and ammonia alerts</Text>
          <Text style={styles.text}>• Test notification system</Text>
          <Text style={styles.text}>• Manage your account and preferences</Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Title style={styles.sectionTitle}>Navigation Guide</Title>
          <Text style={styles.text}>
            Bottom tabs for main sections:
          </Text>
          <Text style={styles.text}>Dashboard - Real-time monitoring overview</Text>
          <Text style={styles.text}>Analytics - Historical data and trends</Text>
          <Text style={styles.text}>Settings - App configuration and preferences</Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Title style={styles.sectionTitle}>Navigation Guide</Title>
          <Text style={styles.text}>
            Bottom tabs for main sections:
          </Text>
          <Text style={styles.text}>Guide - This help section</Text>
          <Text style={styles.text}>Photos - Aquarium photo gallery</Text>
          <Text style={styles.text}>Tips - Maintenance and care advice</Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Title style={styles.sectionTitle}>Feeding & Maintenance</Title>
          <Text style={styles.text}>
            Use the Feed Now button to:
          </Text>
          <Text style={styles.text}>• Log feeding times automatically</Text>
          <Text style={styles.text}>• Track feeding schedule (every 6 hours)</Text>
          <Text style={styles.text}>• Monitor fish health patterns</Text>
          <Text style={styles.text}>
            Regular maintenance reminders:
          </Text>
          <Text style={styles.text}>• Weekly water changes (20-30%)</Text>
          <Text style={styles.text}>• Filter cleaning and media replacement</Text>
          <Text style={styles.text}>• Equipment checks and testing</Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Title style={styles.sectionTitle}>Pro Tips</Title>
          <Text style={styles.text}>• Check the dashboard multiple times daily</Text>
          <Text style={styles.text}>• Respond to alerts immediately</Text>
          <Text style={styles.text}>• Keep emergency supplies ready</Text>
          <Text style={styles.text}>• Document all maintenance activities</Text>
          <Text style={styles.text}>• Use the app's historical data to spot trends</Text>
          <Text style={styles.text}>• Enable notifications for peace of mind</Text>
        </GlassCard>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 40,
    left: 10,
    zIndex: 1,
  },
  container: { flex: 1, backgroundColor: "transparent" },
  content: { padding: 16, paddingBottom: 32, gap: 16 },
  card: { padding: 16 },
  sectionTitle: { color: "#EAF2FF", fontWeight: "800", marginBottom: 12, fontSize: 18 },
  itemTitle: { color: "#EAF2FF", fontWeight: "700" },
  itemDesc: { color: "#C6D4EA" },
  divider: { backgroundColor: "rgba(255,255,255,0.08)", height: 1, marginVertical: 6 },
  text: { color: "#CFE2FF", marginBottom: 4, lineHeight: 20 },
});

