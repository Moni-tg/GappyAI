import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Button, Text, Title, ProgressBar, List, Divider } from 'react-native-paper';
import { useFeed } from '../context/feedprov';
import { useIot } from '../context/iotprov';
import { FeedStatusMessage } from '../services/iot';
import GlassCard from './GlassCard';

export default function FeedCard() {
  const { schedule, history, triggerFeed, isLoading, addHistoryEntry } = useFeed();
  const { sendFeedCommand, onFeedStatus } = useIot();

  // Listen for feed status updates from IoT devices
  useEffect(() => {
    const unsubscribe = onFeedStatus((status: FeedStatusMessage) => {
      // Add the feed status to history
      addHistoryEntry({
        id: status.timestamp,
        timestamp: new Date(status.timestamp),
        amount: status.amount || schedule?.feedAmount || 2.5,
        type: 'automatic',
        success: status.success,
      });

      if (!status.success && status.error) {
        console.error('Feed failed:', status.error);
      }
    });

    return unsubscribe;
  }, [onFeedStatus, addHistoryEntry, schedule?.feedAmount]);

  const handleFeedPress = async () => {
    // Send IoT command first
    try {
      await sendFeedCommand(schedule?.feedAmount);
    } catch (error) {
      console.error('Failed to send feed command:', error);
    }

    // Update local state (for UI feedback)
    await triggerFeed();
  };

  if (!schedule) {
    return (
      <GlassCard style={styles.card}>
        <Title style={styles.title}>Feed System</Title>
        <Text style={styles.noScheduleText}>No feed schedule configured</Text>
      </GlassCard>
    );
  }

  const now = new Date();
  const timeUntilNextFeed = schedule.nextFeedTime
    ? Math.max(0, schedule.nextFeedTime.getTime() - now.getTime())
    : 0;

  const totalInterval = schedule.intervalMinutes * 60 * 1000;
  const progress = totalInterval > 0 ? 1 - (timeUntilNextFeed / totalInterval) : 0;

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  const getLatestFeed = () => {
    // Sort history by timestamp (most recent first) and find the first successful feed
    const sortedHistory = [...history].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return sortedHistory.find(entry => entry.success);
  };

  const latestFeed = getLatestFeed();

  return (
    <GlassCard style={styles.card}>
      <Title style={styles.title}>Automatic Feed System</Title>

      {/* Next Feed Time Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Next Feed</Text>
          <Text style={styles.timeText}>
            {schedule.nextFeedTime ? formatTime(timeUntilNextFeed) : 'Not scheduled'}
          </Text>
        </View>
        <ProgressBar
          progress={progress}
          color="#47BDCE"
          style={styles.progressBar}
        />
        <Text style={styles.scheduleText}>
          Every {schedule.intervalMinutes > 0 ? `${Math.floor(schedule.intervalMinutes / 60)}h ${schedule.intervalMinutes % 60}m` : 'Manual only'} • {schedule.feedAmount}g
        </Text>
      </View>

      <Divider style={styles.divider} />

      {/* Last Feed Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Last Feed</Text>
        <Text style={styles.lastFeedText}>
          {latestFeed ? formatDateTime(latestFeed.timestamp) : 'No recent feeds'}
        </Text>
        {latestFeed && (
          <Text style={styles.feedAmountText}>
            {latestFeed.amount}g • {latestFeed.type}
          </Text>
        )}
      </View>

      <Divider style={styles.divider} />

      {/* Feed History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Feeds</Text>
        {history.length === 0 ? (
          <Text style={styles.noHistoryText}>No feed history</Text>
        ) : (
          history.slice(0, 3).map((entry) => (
            <View key={entry.id} style={styles.historyItem}>
              <View style={styles.historyRow}>
                <Text style={[
                  styles.historyTime,
                  !entry.success && styles.historyError
                ]}>
                  {formatDateTime(entry.timestamp)}
                </Text>
                <Text style={[
                  styles.historyAmount,
                  !entry.success && styles.historyError
                ]}>
                  {entry.amount}g
                </Text>
              </View>
              <Text style={[
                styles.historyType,
                !entry.success && styles.historyError
              ]}>
                {entry.type} {entry.success ? '✓' : '✗'}
              </Text>
            </View>
          ))
        )}
      </View>

      <Divider style={styles.divider} />

      {/* Feed Button */}
      <View style={styles.buttonSection}>
        <Pressable
          style={[styles.feedButton, isLoading && styles.feedButtonDisabled]}
          onPress={handleFeedPress}
          disabled={isLoading}
        >
          <Text style={styles.feedButtonText}>
            {isLoading ? 'Feeding...' : 'Feed Now'}
          </Text>
        </Pressable>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
  },
  title: {
    color: '#EAF2FF',
    fontWeight: '800',
    marginBottom: 16,
    fontSize: 20,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#EAF2FF',
    fontWeight: '700',
    fontSize: 16,
  },
  timeText: {
    color: '#47BDCE',
    fontWeight: '600',
    fontSize: 14,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scheduleText: {
    color: '#C6D4EA',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  lastFeedText: {
    color: '#C6D4EA',
    fontSize: 14,
    marginBottom: 4,
  },
  feedAmountText: {
    color: '#47BDCE',
    fontSize: 12,
  },
  historyItem: {
    marginBottom: 8,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTime: {
    color: '#C6D4EA',
    fontSize: 12,
  },
  historyAmount: {
    color: '#47BDCE',
    fontSize: 12,
    fontWeight: '600',
  },
  historyType: {
    color: '#C6D4EA',
    fontSize: 11,
    marginTop: 2,
  },
  historyError: {
    color: '#FF6B6B',
  },
  noScheduleText: {
    color: '#C6D4EA',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noHistoryText: {
    color: '#C6D4EA',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    height: 1,
    marginVertical: 12,
  },
  buttonSection: {
    alignItems: 'center',
  },
  feedButton: {
    backgroundColor: '#47BDCE',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 4,
  },
  feedButtonDisabled: {
    backgroundColor: '#47BDCE',
    opacity: 0.6,
  },
  feedButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
