import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Card, IconButton, Text, Title } from "react-native-paper";
import GlassCard from "../../components/GlassCard";
import GradientBackground from "../../components/GradientBackground";
import HeroHeader from "../../components/HeroHeader";

const { width } = Dimensions.get('window');

interface FishCareInfo {
  name: string;
  feedingTimes: string;
  feedTypes: string[];
  waterParams: {
    temperature: string;
    ph: string;
    hardness: string;
  };
  tankSize: string;
  compatibility: string;
  specialNotes: string[];
}

const fishCareData: FishCareInfo[] = [
  {
    name: "Neon Tetra",
    feedingTimes: "1-2 times daily, small amounts",
    feedTypes: ["Flake food", "Micro pellets", "Frozen brine shrimp", "Bloodworms"],
    waterParams: {
      temperature: "22-26°C (72-78°F)",
      ph: "6.0-7.0",
      hardness: "Soft to medium (2-10 dGH)"
    },
    tankSize: "20+ liters",
    compatibility: "Peaceful community fish",
    specialNotes: ["School in groups of 6+", "Sensitive to poor water quality", "Need hiding places"]
  },
  {
    name: "Guppy",
    feedingTimes: "1-2 times daily, small portions",
    feedTypes: ["Flake food", "Pellets", "Frozen foods", "Live brine shrimp"],
    waterParams: {
      temperature: "22-28°C (72-82°F)",
      ph: "7.0-8.0",
      hardness: "Hard water preferred (10-20 dGH)"
    },
    tankSize: "40+ liters",
    compatibility: "Peaceful, active swimmers",
    specialNotes: ["Livebearers, males can harass females", "Need plants for fry protection", "Very hardy and adaptable"]
  },
  {
    name: "Betta Fish",
    feedingTimes: "1-2 times daily, 2-3 pellets per feeding",
    feedTypes: ["Betta pellets", "Betta flakes", "Frozen bloodworms", "Live insects"],
    waterParams: {
      temperature: "24-28°C (75-82°F)",
      ph: "6.5-7.5",
      hardness: "Soft to medium (4-12 dGH)"
    },
    tankSize: "20+ liters",
    compatibility: "Generally solitary",
    specialNotes: ["Males are aggressive to each other", "Need surface access for breathing", "Sensitive to strong currents"]
  },
  {
    name: "Goldfish",
    feedingTimes: "2 times daily, small amounts only",
    feedTypes: ["Goldfish flakes", "Sinking pellets", "Vegetables", "Frozen foods"],
    waterParams: {
      temperature: "18-24°C (64-75°F)",
      ph: "7.0-8.0",
      hardness: "Medium to hard (10-20 dGH)"
    },
    tankSize: "80+ liters per fish",
    compatibility: "Peaceful with other goldfish",
    specialNotes: ["Produce lots of waste", "Need strong filtration", "Can grow very large"]
  },
  {
    name: "Angelfish",
    feedingTimes: "1-2 times daily, what they eat in 2-3 minutes",
    feedTypes: ["Cichlid pellets", "Flakes", "Frozen mysis shrimp", "Vegetable matter"],
    waterParams: {
      temperature: "24-28°C (75-82°F)",
      ph: "6.5-7.0",
      hardness: "Soft to medium (3-8 dGH)"
    },
    tankSize: "200+ liters",
    compatibility: "Semi-aggressive",
    specialNotes: ["Can be territorial when breeding", "Need tall tanks", "May eat small fish"]
  },
  {
    name: "Zebra Danio",
    feedingTimes: "1-2 times daily, small amounts",
    feedTypes: ["Flake food", "Micro pellets", "Frozen daphnia", "Live baby brine shrimp"],
    waterParams: {
      temperature: "22-26°C (72-78°F)",
      ph: "6.5-7.5",
      hardness: "Soft to medium (5-12 dGH)"
    },
    tankSize: "40+ liters",
    compatibility: "Very peaceful, active schooling fish",
    specialNotes: ["School in groups of 6+", "Very hardy and beginner-friendly", "Need swimming space"]
  },
  {
    name: "Corydoras Catfish",
    feedingTimes: "1-2 times daily, bottom feeding",
    feedTypes: ["Sinking pellets", "Catfish tablets", "Frozen bloodworms", "Vegetables"],
    waterParams: {
      temperature: "22-26°C (72-78°F)",
      ph: "6.0-7.5",
      hardness: "Soft to medium (2-12 dGH)"
    },
    tankSize: "60+ liters",
    compatibility: "Peaceful bottom dwellers",
    specialNotes: ["Need sandy substrate", "School in groups of 3-6", "Sensitive to poor water quality"]
  },
  {
    name: "Platy",
    feedingTimes: "1-2 times daily, small portions",
    feedTypes: ["Flake food", "Pellets", "Frozen foods", "Vegetable matter"],
    waterParams: {
      temperature: "22-26°C (72-78°F)",
      ph: "7.0-8.0",
      hardness: "Medium to hard (10-25 dGH)"
    },
    tankSize: "40+ liters",
    compatibility: "Peaceful community fish",
    specialNotes: ["Livebearers, prolific breeders", "Need plants for fry", "Very hardy and colorful"]
  },
  {
    name: "Swordtail",
    feedingTimes: "1-2 times daily, small amounts",
    feedTypes: ["Flake food", "Pellets", "Frozen brine shrimp", "Vegetable flakes"],
    waterParams: {
      temperature: "22-26°C (72-78°F)",
      ph: "7.0-8.2",
      hardness: "Medium to hard (12-25 dGH)"
    },
    tankSize: "80+ liters",
    compatibility: "Peaceful but active",
    specialNotes: ["Livebearers, males have swords", "Need swimming space", "Can hybridize with platies"]
  },
  {
    name: "Molly",
    feedingTimes: "1-2 times daily, vegetable-rich diet",
    feedTypes: ["Spirulina flakes", "Vegetable pellets", "Frozen foods", "Live plants"],
    waterParams: {
      temperature: "24-28°C (75-82°F)",
      ph: "7.5-8.5",
      hardness: "Hard water (15-30 dGH)"
    },
    tankSize: "80+ liters",
    compatibility: "Peaceful community fish",
    specialNotes: ["Need salt in water (1 tsp per 20L)", "Livebearers, need plants", "Sensitive to nitrite spikes"]
  }
];

export default function TipsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFish, setFilteredFish] = useState<FishCareInfo[]>(fishCareData);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFish(fishCareData);
    } else {
      const filtered = fishCareData.filter((fish) => {
        const query = searchQuery.toLowerCase();
        return (
          fish.name.toLowerCase().includes(query) ||
          fish.compatibility.toLowerCase().includes(query) ||
          fish.feedTypes.some(type => type.toLowerCase().includes(query)) ||
          fish.tankSize.toLowerCase().includes(query) ||
          fish.specialNotes.some(note => note.toLowerCase().includes(query)) ||
          fish.waterParams.temperature.toLowerCase().includes(query) ||
          fish.waterParams.ph.toLowerCase().includes(query) ||
          fish.waterParams.hardness.toLowerCase().includes(query)
        );
      });
      setFilteredFish(filtered);
    }
  }, [searchQuery]);

  const renderFishCard = (fish: FishCareInfo) => (
    <GlassCard key={fish.name} style={styles.fishCard}>
      <Card.Content>
        <Title style={styles.fishName}>{fish.name}</Title>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Feeding Schedule</Text>
          <Text style={styles.infoText}>{fish.feedingTimes}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Food Types</Text>
          <View style={styles.foodList}>
            {fish.feedTypes.map((food, index) => (
              <Text key={index} style={styles.foodItem}>• {food}</Text>
            ))}
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Water Parameters</Text>
          <Text style={styles.paramText}>Temperature: {fish.waterParams.temperature}</Text>
          <Text style={styles.paramText}>pH: {fish.waterParams.ph}</Text>
          <Text style={styles.paramText}>Hardness: {fish.waterParams.hardness}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Tank Requirements</Text>
          <Text style={styles.infoText}>Tank Size: {fish.tankSize}</Text>
          <Text style={styles.infoText}>Compatibility: {fish.compatibility}</Text>
        </View>

        {fish.specialNotes.length > 0 && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Special Notes</Text>
            <View style={styles.notesList}>
              {fish.specialNotes.map((note, index) => (
                <Text key={index} style={styles.noteItem}>• {note}</Text>
              ))}
            </View>
          </View>
        )}
      </Card.Content>
    </GlassCard>
  );

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
        <HeroHeader
          title="Fish Care Tips"
          subtitle="Detailed care guide for 15+ popular aquarium fish species"
        />

        <GlassCard style={styles.searchCard}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search fish species, care info, compatibility..."
            placeholderTextColor="#8A9BA8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </GlassCard>

        <GlassCard style={styles.introCard}>
          <Title style={styles.introTitle}>Essential Care Guidelines</Title>
          <Text style={styles.introText}>
            Each fish species has unique requirements for feeding, water quality, and tank conditions.
            Always research thoroughly before adding new fish to your aquarium.
          </Text>
        </GlassCard>

        {filteredFish.length === 0 ? (
          <GlassCard style={styles.noResultsCard}>
            <Text style={styles.noResultsText}>No fish found matching your search.</Text>
            <Text style={styles.noResultsSubtext}>Try searching for fish names, compatibility, or care requirements.</Text>
          </GlassCard>
        ) : (
          filteredFish.map(renderFishCard)
        )}

        <GlassCard style={styles.footerCard}>
          <Title style={styles.footerTitle}>General Tips</Title>
          <Text style={styles.footerText}>
            • Never overfeed - uneaten food causes water quality issues{'\n'}
            • Monitor water parameters regularly{'\n'}
            • Perform regular water changes (20-30% weekly){'\n'}
            • Quarantine new fish for 2-4 weeks{'\n'}
            • Research compatibility before mixing species
          </Text>
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
  container: {
    flex: 1,
    backgroundColor: "transparent"
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16
  },
  searchCard: {
    padding: 12,
  },
  searchInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: 12,
    color: "#EAF2FF",
    fontSize: 16,
  },
  introCard: {
    padding: 16,
  },
  introTitle: {
    color: "#EAF2FF",
    fontWeight: "700",
    marginBottom: 8,
  },
  introText: {
    color: "#CFE2FF",
    lineHeight: 20,
  },
  fishCard: {
    padding: 0,
    marginBottom: 8,
  },
  fishName: {
    color: "#47BDCE",
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 12,
  },
  infoSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#EAF2FF",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  infoText: {
    color: "#CFE2FF",
    lineHeight: 20,
  },
  paramText: {
    color: "#CFE2FF",
    lineHeight: 20,
    marginBottom: 2,
  },
  foodList: {
    marginTop: 4,
  },
  foodItem: {
    color: "#CFE2FF",
    lineHeight: 18,
    marginBottom: 2,
  },
  notesList: {
    marginTop: 4,
  },
  noteItem: {
    color: "#CFE2FF",
    lineHeight: 18,
    marginBottom: 2,
  },
  footerCard: {
    padding: 16,
    marginTop: 8,
  },
  footerTitle: {
    color: "#EAF2FF",
    fontWeight: "700",
    marginBottom: 12,
  },
  footerText: {
    color: "#CFE2FF",
    lineHeight: 22,
  },
  noResultsCard: {
    padding: 20,
    alignItems: "center",
  },
  noResultsText: {
    color: "#EAF2FF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  noResultsSubtext: {
    color: "#CFE2FF",
    textAlign: "center",
    lineHeight: 20,
  },
});
