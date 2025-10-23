import React, { useState } from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { Text, List, Divider, Chip, Searchbar } from "react-native-paper";
import GlassCard from "../../components/GlassCard";
import GradientBackground from "../../components/GradientBackground";
import HeroHeader from "../../components/HeroHeader";

interface HistoryEntry {
  id: string;
  type: 'measurement' | 'maintenance' | 'feeding' | 'alert';
  title: string;
  description: string;
  value?: string;
  unit?: string;
  timestamp: string;
  date: string;
}

export default function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'measurement' | 'maintenance' | 'feeding' | 'alert'>('all');

  // Mock history data
  const historyData: HistoryEntry[] = [
    {
      id: '1',
      type: 'measurement',
      title: 'Water Temperature',
      description: 'Daily measurement',
      value: '24.5',
      unit: '°C',
      timestamp: '2 hours ago',
      date: 'Today, 14:30'
    },
    {
      id: '2',
      type: 'maintenance',
      title: 'Water Change',
      description: '25% water change completed',
      timestamp: '1 day ago',
      date: 'Yesterday, 16:00'
    },
    {
      id: '3',
      type: 'feeding',
      title: 'Fish Feeding',
      description: 'Regular feeding - flakes',
      value: '2',
      unit: 'pinches',
      timestamp: '1 day ago',
      date: 'Yesterday, 08:00'
    },
    {
      id: '4',
      type: 'measurement',
      title: 'pH Level',
      description: 'Daily measurement',
      value: '7.0',
      unit: '',
      timestamp: '2 days ago',
      date: '2 days ago, 14:30'
    },
    {
      id: '5',
      type: 'alert',
      title: 'High Ammonia Alert',
      description: 'Ammonia level above normal range',
      value: '0.8',
      unit: 'ppm',
      timestamp: '3 days ago',
      date: '3 days ago, 09:15'
    },
    {
      id: '6',
      type: 'maintenance',
      title: 'Filter Cleaning',
      description: 'Monthly filter maintenance',
      timestamp: '5 days ago',
      date: '5 days ago, 11:00'
    },
    {
      id: '7',
      type: 'feeding',
      title: 'Fish Feeding',
      description: 'Regular feeding - pellets',
      value: '3',
      unit: 'pellets',
      timestamp: '6 days ago',
      date: '6 days ago, 08:00'
    },
    {
      id: '8',
      type: 'measurement',
      title: 'Oxygen Level',
      description: 'Daily measurement',
      value: '8.5',
      unit: 'mg/L',
      timestamp: '1 week ago',
      date: '1 week ago, 14:30'
    }
  ];

  const getFilterColor = (type: string) => {
    switch (type) {
      case 'measurement': return '#47BDCE';
      case 'maintenance': return '#FFE66D';
      case 'feeding': return '#4ECDC4';
      case 'alert': return '#FF6B6B';
      default: return '#9CA3AF';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'measurement': return 'chart-line';
      case 'maintenance': return 'wrench';
      case 'feeding': return 'food';
      case 'alert': return 'alert';
      default: return 'information';
    }
  };

  const filteredData = historyData.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || entry.type === filter;
    return matchesSearch && matchesFilter;
  });

  const filterChips = [
    { label: 'All', value: 'all' },
    { label: 'Measurements', value: 'measurement' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Feeding', value: 'feeding' },
    { label: 'Alerts', value: 'alert' }
  ];

  return (
    <GradientBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <HeroHeader
          title="Activity History"
          subtitle="Track your aquarium maintenance and measurements"
        />

        {/* Search Bar */}
        <GlassCard style={styles.searchCard}>
          <Searchbar
            placeholder="Search history..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={{ color: '#EAF2FF' }}
            placeholderTextColor="rgba(234, 242, 255, 0.6)"
          />
        </GlassCard>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
          style={styles.filterScroll}
        >
          {filterChips.map((chip) => (
            <Chip
              key={chip.value}
              selected={filter === chip.value}
              onPress={() => setFilter(chip.value as any)}
              style={[
                styles.filterChip,
                { backgroundColor: filter === chip.value ? getFilterColor(chip.value) : 'rgba(255,255,255,0.08)' }
              ]}
              textStyle={{ color: filter === chip.value ? '#0B1B2B' : '#EAF2FF' }}
            >
              {chip.label}
            </Chip>
          ))}
        </ScrollView>

        {/* History Entries */}
        <GlassCard style={styles.historyCard}>
          <Text style={styles.historyTitle}>Recent Activity</Text>

          {filteredData.map((entry, index) => (
            <View key={entry.id}>
              <View style={styles.historyEntry}>
                <View style={styles.entryIcon}>
                  <View style={[styles.iconCircle, { backgroundColor: getFilterColor(entry.type) }]} />
                </View>

                <View style={styles.entryContent}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                    <Text style={styles.entryTime}>{entry.timestamp}</Text>
                  </View>

                  <Text style={styles.entryDescription}>{entry.description}</Text>

                  <View style={styles.entryMeta}>
                    <Text style={styles.entryDate}>{entry.date}</Text>
                    {entry.value && (
                      <View style={[styles.valueBadge, { backgroundColor: getFilterColor(entry.type) }]}>
                        <Text style={styles.valueText}>
                          {entry.value}{entry.unit}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {index < filteredData.length - 1 && <Divider style={styles.entryDivider} />}
            </View>
          ))}
        </GlassCard>
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
    paddingBottom: 32,
    gap: 16,
  },
  searchCard: {
    padding: 0,
  },
  searchBar: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
  },
  filterContainer: {
    gap: 8,
    paddingVertical: 8,
  },
  filterScroll: {
    maxHeight: 50,
  },
  filterChip: {
    marginRight: 8,
  },
  historyCard: {
    padding: 16,
  },
  historyTitle: {
    color: '#EAF2FF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  historyEntry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  entryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  entryContent: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  entryTitle: {
    color: '#EAF2FF',
    fontSize: 16,
    fontWeight: '600',
  },
  entryTime: {
    color: '#C6D4EA',
    fontSize: 12,
  },
  entryDescription: {
    color: '#C6D4EA',
    fontSize: 14,
    marginBottom: 8,
  },
  entryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDate: {
    color: 'rgba(234, 242, 255, 0.6)',
    fontSize: 12,
  },
  valueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  valueText: {
    color: '#0B1B2B',
    fontSize: 12,
    fontWeight: '600',
  },
  entryDivider: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 8,
  },
});