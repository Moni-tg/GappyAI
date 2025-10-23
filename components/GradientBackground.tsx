import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, ViewStyle } from "react-native";

type GradientBackgroundProps = {
  children: React.ReactNode;
  colors?: readonly [string, string, ...string[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle | ViewStyle[];
};

export default function GradientBackground({
  children,
  colors = ["#0B1B2B", "#0E2440", "#113354"] as const,
  start = { x: 0.1, y: 0.0 },
  end = { x: 1, y: 1 },
  style,
}: GradientBackgroundProps) {
  return (
    <LinearGradient colors={colors} start={start} end={end} style={[styles.container, style]}> 
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
