import { createContext, useContext, useEffect, useState } from 'react';

export interface FeedSchedule {
  id: string;
  name: string;
  enabled: boolean;
  intervalMinutes: number;
  nextFeedTime: Date | null;
  lastFeedTime: Date | null;
  feedAmount: number; // grams or ml
}

export interface FeedHistory {
  id: string;
  timestamp: Date;
  amount: number;
  type: 'automatic' | 'manual';
  success: boolean;
}

export interface FeedContextType {
  schedule: FeedSchedule | null;
  history: FeedHistory[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setSchedule: (schedule: FeedSchedule) => void;
  triggerFeed: (amount?: number) => Promise<boolean>;
  updateNextFeedTime: () => void;
  addHistoryEntry: (entry: FeedHistory) => void;
  clearHistory: () => void;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export function useFeed() {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error('useFeed must be used within a FeedProvider');
  return ctx;
}

export function FeedProvider({ children }: { children: React.ReactNode }) {
  const [schedule, setScheduleState] = useState<FeedSchedule | null>(null);
  const [history, setHistory] = useState<FeedHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data from storage or API
  useEffect(() => {
    loadInitialData();
  }, []);

  // Set up automatic feed timer
  useEffect(() => {
    if (!schedule?.enabled || !schedule.nextFeedTime) return;

    const now = new Date();
    const timeUntilNextFeed = schedule.nextFeedTime.getTime() - now.getTime();

    if (timeUntilNextFeed <= 0) {
      // Time to feed now
      performAutomaticFeed();
      return;
    }

    const timer = setTimeout(() => {
      performAutomaticFeed();
    }, timeUntilNextFeed);

    return () => clearTimeout(timer);
  }, [schedule?.nextFeedTime]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      // For now, set default schedule
      const defaultSchedule: FeedSchedule = {
        id: 'default',
        name: 'Regular Feeding',
        enabled: true,
        intervalMinutes: 480, // 8 hours
        nextFeedTime: new Date(Date.now() + 480 * 60 * 1000),
        lastFeedTime: null,
        feedAmount: 2.5,
      };
      setScheduleState(defaultSchedule);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const setSchedule = (newSchedule: FeedSchedule) => {
    setScheduleState(newSchedule);
    // TODO: Save to AsyncStorage or API
  };

  const triggerFeed = async (amount?: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const feedAmount = amount || schedule?.feedAmount || 2.5;

      // TODO: Send command to IoT device/feeder
      // For now, simulate the feed operation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create history entry
      const historyEntry: FeedHistory = {
        id: Date.now().toString(),
        timestamp: new Date(),
        amount: feedAmount,
        type: 'manual',
        success: true,
      };

      addHistoryEntry(historyEntry);

      // Update schedule
      if (schedule) {
        const newSchedule = {
          ...schedule,
          lastFeedTime: new Date(),
          nextFeedTime: new Date(Date.now() + schedule.intervalMinutes * 60 * 1000),
        };
        setSchedule(newSchedule);
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      // Add failed history entry
      const failedEntry: FeedHistory = {
        id: Date.now().toString(),
        timestamp: new Date(),
        amount: amount || schedule?.feedAmount || 2.5,
        type: 'manual',
        success: false,
      };
      addHistoryEntry(failedEntry);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const performAutomaticFeed = async () => {
    if (!schedule?.enabled) return;

    try {
      // TODO: Send command to IoT device/feeder
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create history entry
      const historyEntry: FeedHistory = {
        id: Date.now().toString(),
        timestamp: new Date(),
        amount: schedule.feedAmount,
        type: 'automatic',
        success: true,
      };

      addHistoryEntry(historyEntry);

      // Update schedule
      const newSchedule = {
        ...schedule,
        lastFeedTime: new Date(),
        nextFeedTime: new Date(Date.now() + schedule.intervalMinutes * 60 * 1000),
      };
      setSchedule(newSchedule);
    } catch (err: any) {
      // Add failed history entry
      const failedEntry: FeedHistory = {
        id: Date.now().toString(),
        timestamp: new Date(),
        amount: schedule.feedAmount,
        type: 'automatic',
        success: false,
      };
      addHistoryEntry(failedEntry);
    }
  };

  const updateNextFeedTime = () => {
    if (!schedule) return;

    const newSchedule = {
      ...schedule,
      nextFeedTime: new Date(Date.now() + schedule.intervalMinutes * 60 * 1000),
    };
    setSchedule(newSchedule);
  };

  const addHistoryEntry = (entry: FeedHistory) => {
    setHistory(prev => [entry, ...prev].slice(0, 100)); // Keep last 100 entries
    // TODO: Save to AsyncStorage or API
  };

  const clearHistory = () => {
    setHistory([]);
    // TODO: Clear from AsyncStorage or API
  };

  const value: FeedContextType = {
    schedule,
    history,
    isLoading,
    error,
    setSchedule,
    triggerFeed,
    updateNextFeedTime,
    addHistoryEntry,
    clearHistory,
  };

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}
