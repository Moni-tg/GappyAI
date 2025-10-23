import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";
import GlassCard from "./GlassCard";

interface HeroHeaderProps {
  title: string;
  subtitle?: string;
  imageSource?: ImageSourcePropType;
  showDots?: boolean;
}

export default function HeroHeader({ title, subtitle, imageSource, showDots = false }: HeroHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.heroLayer}>
        {imageSource ? (
          <Image source={imageSource} resizeMode="cover" style={styles.heroImage} />
        ) : (
          <View style={styles.placeholderCircle} />
        )}
      </View>

      <GlassCard intensity={30} tint="dark" style={styles.textCard}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </GlassCard>

      {showDots ? (
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 12,
  },
  heroLayer: {
    height: 220,
    width: 220,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  heroImage: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
    borderColor: "rgba(95, 146, 187, 0.15)",
  },
  placeholderCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  textCard: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: -10,
  },
  title: {
    color: "#EAF2FF",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  subtitle: {
    color: "#C6D4EA",
    marginTop: 4,
  },
  dots: {
    marginTop: 18,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  dotActive: {
    backgroundColor: "#76D9DB",
  },
});
