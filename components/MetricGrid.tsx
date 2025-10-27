import React from "react";
import { StyleSheet, Text, View } from "react-native";
import GlassCard from "./GlassCard";

export type MetricItem = {
  label: string;
  value?: string | number;
  unit?: string;
  isPercentage?: boolean;
};

interface MetricGridProps {
  items: MetricItem[];
}

export default function MetricGrid({ items }: MetricGridProps) {
  return (
    <View style={styles.grid}>
      {items.map((m, i) => (
        <GlassCard key={i} style={styles.card}>
          <Text style={styles.label}>{m.label}</Text>
          {m.value !== undefined ? (
            m.isPercentage ? (
              <View style={styles.percentageContainer}>
                <Text style={styles.percentageValue}>{m.value}%</Text>
                <View style={styles.percentageBar}>
                  <View style={[styles.percentageFill, { width: `${Math.min(Number(m.value), 100)}%` }]} />
                </View>
              </View>
            ) : (
              <Text style={styles.value}>
                {m.value}
                {m.unit ? <Text style={styles.unit}> {m.unit}</Text> : null}
              </Text>
            )
          ) : (
            <Text style={styles.placeholder}>--</Text>
          )}
        </GlassCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  card: {
    width: "48%",
  },
  label: {
    color: "#C6D4EA",
    fontWeight: "700",
    marginBottom: 8,
    fontSize:18
  },
  value: {
    color: "#EAF2FF",
    fontSize: 20,
    fontWeight: "800",
  },
  unit: {
    color: "#C6D4EA",
    fontSize: 14,
    fontWeight: "600",
  },
  placeholder: {
    color: "#9FB1CC",
    fontSize: 22,
    fontWeight: "700",
  },
  percentageContainer: {
    alignItems: "center",
  },
  percentageValue: {
    color: "#EAF2FF",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
  },
  percentageBar: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  percentageFill: {
    height: "100%",
    backgroundColor: "#4ECDC4",
    borderRadius: 4,
  },
});
