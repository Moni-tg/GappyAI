import { useState, useEffect } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Divider, List, Switch, Text, useTheme } from "react-native-paper";
import GlassCard from "../../components/GlassCard";
import GradientBackground from "../../components/GradientBackground";
import { useAuth } from "../../context/authprov";
import { useNotifications } from "../../context/NotificationContext";
import { notificationService } from "../../services/notificationService";
import { notificationTestUtils } from "../../services/notificationTestUtils";

export default function Settings() {
  const notificationContext = useNotifications();
  const [darkMode, setDarkMode] = useState(false);
  const [biometrics, setBiometrics] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  const { signOut, user } = useAuth();
  const theme = useTheme();

  // Load notification settings on component mount
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const enabled = await notificationService.areNotificationsEnabled();
        // Use context values instead of local state
        // For now, we'll use the current state values
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    };

    loadNotificationSettings();
  }, []);

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await notificationService.requestPermissions();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Notification permissions are required to receive alerts. Please enable notifications in your device settings."
        );
      }
    }
  };

  const handleCriticalAlertsToggle = async (enabled: boolean) => {
    // Here you would save the preference and update notification subscriptions
  };

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleResetPassword = () => {
    Alert.alert(
      "Reset Password",
      "This will send a password reset email to your registered email address.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Send Email",
          onPress: () => {
            // TODO: Implement password reset
            Alert.alert("Info", "Password reset email sent!");
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert("Info", "Account deletion requested. You will receive a confirmation email.");
          },
        },
      ]
    );
  };

  return (
    <GradientBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* User Profile Section */}
        <GlassCard style={styles.profileCard}>
          <View style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <Avatar.Text
                size={70}
                label={user?.name?.charAt(0)?.toUpperCase() || "U"}
                style={styles.avatar}
              />
            </View>
            <View style={styles.userInfo}>
              <Text variant="headlineMedium" style={styles.userName}>
                {user?.name || "User"}
              </Text>
              <Text variant="bodyLarge" style={styles.userEmail}>
                {user?.email || "user@example.com"}
              </Text>
              <View style={styles.userBadge}>
                <Text style={styles.userBadgeText}>Premium Member</Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Account Settings */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Account Settings
            </Text>
          </View>
          <View style={styles.sectionContent}>

            <List.Item
              title="Change Password"
              description="Update your account password"
              left={(props) => <List.Icon {...props} icon="lock-reset" color="#47BDCE" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color="#47BDCE" />}
              onPress={handleResetPassword}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDesc}
            />

            <Divider style={styles.divider} />

            <List.Item
              title="Delete Account"
              titleStyle={[styles.listTitle, styles.dangerText]}
              description="Permanently delete your account"
              left={(props) => <List.Icon {...props} icon="account-remove" color="#d32f2f" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color="#47BDCE" />}
              onPress={handleDeleteAccount}
              style={styles.listItem}
              descriptionStyle={styles.listDesc}
            />
          </View>
        </GlassCard>

        {/* Notification Settings */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Notifications
            </Text>
          </View>
          <View style={styles.sectionContent}>

            <List.Item
              title="Push Notifications"
              description="Receive push notifications for alerts"
              left={(props) => <List.Icon {...props} icon="bell" color="#47BDCE" />}
              right={() => (
                <Switch
                  value={notificationContext.notificationsEnabled}
                  onValueChange={handleNotificationToggle}
                  color="#47BDCE"
                />
              )}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDesc}
            />

            <Divider style={styles.divider} />

            <List.Item
              title="Critical Alerts"
              description="High priority alerts only"
              left={(props) => <List.Icon {...props} icon="alert-circle" color="#d32f2f" />}
              right={() => (
                <Switch
                  value={notificationContext.criticalAlertsEnabled}
                  onValueChange={handleCriticalAlertsToggle}
                  color="#47BDCE"
                />
              )}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDesc}
            />

            <Divider style={styles.divider} />

            <List.Item
              title="Temperature Alerts"
              description="Water temperature monitoring"
              left={(props) => <List.Icon {...props} icon="thermometer" color="#47BDCE" />}
              right={() => (
                <Switch
                  value={notificationContext.temperatureAlertsEnabled}
                  onValueChange={() => {}} // TODO: Implement handler
                  color="#47BDCE"
                />
              )}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDesc}
            />

            <Divider style={styles.divider} />

            <List.Item
              title="pH Level Alerts"
              description="Water acidity monitoring"
              left={(props) => <List.Icon {...props} icon="test-tube" color="#47BDCE" />}
              right={() => (
                <Switch
                  value={notificationContext.phAlertsEnabled}
                  onValueChange={() => {}} // TODO: Implement handler
                  color="#47BDCE"
                />
              )}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDesc}
            />

            <Divider style={styles.divider} />

            <List.Item
              title="Turbidity Alerts"
              description="Water clarity monitoring"
              left={(props) => <List.Icon {...props} icon="eye" color="#47BDCE" />}
              right={() => (
                <Switch
                  value={notificationContext.turbidityAlertsEnabled}
                  onValueChange={() => {}} // TODO: Implement handler
                  color="#47BDCE"
                />
              )}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDesc}
            />

            <Divider style={styles.divider} />

            <List.Item
              title="Test Notifications"
              description="Run comprehensive notification tests"
              left={(props) => <List.Icon {...props} icon="test-tube" color="#47BDCE" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color="#47BDCE" />}
              onPress={async () => {
                try {
                  const results = await notificationTestUtils.runFullNotificationTest();
                  notificationTestUtils.showTestResults(results);
                } catch (error) {
                  Alert.alert(
                    "Test Error",
                    "Failed to run notification tests. Check console for details."
                  );
                }
              }}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDesc}
            />
          </View>
        </GlassCard>

        {/* App Preferences */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              App Preferences
            </Text>
          </View>
          <View style={styles.sectionContent}>

            <List.Item
              title="Biometric Authentication"
              description="Use fingerprint or face unlock"
              left={(props) => <List.Icon {...props} icon="fingerprint" color="#47BDCE" />}
              right={() => (
                <Switch
                  value={biometrics}
                  onValueChange={setBiometrics}
                  color="#47BDCE"
                />
              )}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDesc}
            />

            <Divider style={styles.divider} />

            <List.Item
              title="Analytics"
              description="Help improve the app"
              left={(props) => <List.Icon {...props} icon="chart-line" color="#47BDCE" />}
              right={() => (
                <Switch
                  value={analytics}
                  onValueChange={setAnalytics}
                  color="#47BDCE"
                />
              )}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDesc}
            />
          </View>
        </GlassCard>

        {/* Support & Info */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Support & Information
            </Text>
          </View>
          <View style={styles.sectionContent}>

            <List.Item
              title="Help & Support"
              description="Get help and contact support"
              left={(props) => <List.Icon {...props} icon="help-circle" color="#47BDCE" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color="#47BDCE" />}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDesc}
            />

            <Divider style={styles.divider} />

            <List.Item
              title="Privacy Policy"
              description="Read our privacy policy"
              left={(props) => <List.Icon {...props} icon="shield-check" color="#47BDCE" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color="#47BDCE" />}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDesc}
            />

            <Divider style={styles.divider} />

            <List.Item
              title="Terms of Service"
              description="Read our terms of service"
              left={(props) => <List.Icon {...props} icon="file-document" color="#47BDCE" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color="#47BDCE" />}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDesc}
            />

            <Divider style={styles.divider} />

            <List.Item
              title="About"
              description={`Version 1.0.0`}
              left={(props) => <List.Icon {...props} icon="information" color="#47BDCE" />}
              style={styles.listItem}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDesc}
            />
          </View>
        </GlassCard>

        {/* Sign Out Button */}
        <View style={styles.signOutContainer}>
          <Pressable style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    gap: 16,
    paddingBottom: 32,
  },
  profileCard: {
    padding: 24,
    marginBottom: 8,
    opacity: 0.95,
    transform: [{ scale: 1 }],
  },
  sectionCard: {
    padding: 0,
    marginBottom: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    opacity: 0.9,
    transform: [{ scale: 1 }],
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 20,
    position: "relative",
  },
  avatar: {
    backgroundColor: "#47BDCE",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: "#EAF2FF",
    fontWeight: "700",
    marginBottom: 6,
    fontSize: 20,
  },
  userEmail: {
    color: "#C6D4EA",
    marginBottom: 8,
    fontSize: 16,
  },
  userBadge: {
    backgroundColor: "rgba(71, 189, 206, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(71, 189, 206, 0.3)",
  },
  userBadgeText: {
    color: "#47BDCE",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionHeader: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  sectionContent: {
    padding: 0,
  },
  sectionTitle: {
    color: "#EAF2FF",
    fontWeight: "700",
    fontSize: 18,
  },
  listItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginVertical: 2,
    borderRadius: 8,
    marginHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  listTitle: {
    color: "#EAF2FF",
    fontWeight: "600",
    fontSize: 16,
  },
  listDesc: {
    color: "#C6D4EA",
    fontSize: 14,
  },
  divider: {
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 20,
    marginVertical: 4,
  },
  dangerText: {
    color: "#d32f2f",
    fontWeight: "500",
  },
  signOutContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  signOutButton: {
    backgroundColor: "#d32f2f",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginHorizontal: 8,
    elevation: 4,
    shadowColor: '#d32f2f',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  signOutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
