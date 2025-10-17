import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface GlassCardProps {
  children?: React.ReactNode;
  intensity?: number;
  tint?: "light" | "dark" | "default";
  style?: ViewStyle | ViewStyle[];
}

export default function GlassCard({
  children,
  intensity = 40,
  tint = "dark",
  style,
}: GlassCardProps) {
  return (
    <View style={[styles.wrapper, style]}> 
      <BlurView intensity={intensity} tint={tint} style={styles.blur}>
        <View style={styles.inner}>{children}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  blur: {
    padding: 14,
  },
  inner: {
    backgroundColor: "transprent",
    // spacer to allow children styles to take place
  },
});
