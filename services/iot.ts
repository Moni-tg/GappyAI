// IoT service scaffold for future MQTT/WebSocket integration
// This module is intentionally dependency-free. When ready, plug in a client (e.g., mqtt over WebSocket).

export type IotConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export type IotMessage = {
  topic: string;
  payload: string | Uint8Array;
  retained?: boolean;
  qos?: 0 | 1 | 2;
};

// Feed system message types
export type FeedCommandMessage = {
  type: 'feed_command';
  amount?: number;
  timestamp: string;
};

export type FeedStatusMessage = {
  type: 'feed_status';
  success: boolean;
  amount?: number;
  timestamp: string;
  error?: string;
};

export type FeedScheduleMessage = {
  type: 'feed_schedule';
  enabled: boolean;
  intervalMinutes: number;
  amount: number;
  nextFeedTime?: string;
};

export type IotConfig = {
  url: string; // e.g. wss://broker.example.com:8083/mqtt
  username?: string;
  password?: string;
  clientId?: string;
  topicPrefix?: string; // optional helper prefix
};

export interface IIotClient {
  connect: (config: IotConfig) => Promise<void>;
  disconnect: () => Promise<void>;
  publish: (msg: IotMessage) => Promise<void>;
  subscribe: (topic: string) => Promise<void>;
  unsubscribe: (topic: string) => Promise<void>;
  onMessage: (cb: (msg: IotMessage) => void) => void;
}

// Simple in-memory client stub. Replace internals when integrating a real client.
export class IotClient implements IIotClient {
  private messageCb: ((msg: IotMessage) => void) | null = null;
  private connected = false;

  async connect(config: IotConfig): Promise<void> {
    // TODO: Replace with real MQTT/WebSocket client connect
    // Example when using mqtt.js:
    // this.client = mqtt.connect(config.url, { username: config.username, password: config.password, clientId: config.clientId })
    // this.client.on('message', (topic, payload) => this.messageCb?.({ topic, payload }))
    await new Promise((r) => setTimeout(r, 300));
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    // TODO: Replace with real disconnect
    await new Promise((r) => setTimeout(r, 100));
    this.connected = false;
  }

  async publish(msg: IotMessage): Promise<void> {
    if (!this.connected) throw new Error("IotClient not connected");
    // TODO: Replace with real publish
    // Simulate echo to onMessage for local testing
    this.messageCb?.(msg);
  }

  async subscribe(_topic: string): Promise<void> {
    if (!this.connected) throw new Error("IotClient not connected");
    // TODO: Replace with real subscribe
  }

  async unsubscribe(_topic: string): Promise<void> {
    if (!this.connected) throw new Error("IotClient not connected");
    // TODO: Replace with real unsubscribe
  }

  onMessage(cb: (msg: IotMessage) => void): void {
    this.messageCb = cb;
  }
}

export function readIotEnv(): IotConfig | null {
  const url = process.env.EXPO_PUBLIC_MQTT_URL;
  if (!url) return null;
  return {
    url,
    username: process.env.EXPO_PUBLIC_MQTT_USERNAME,
    password: process.env.EXPO_PUBLIC_MQTT_PASSWORD,
    clientId: process.env.EXPO_PUBLIC_MQTT_CLIENT_ID,
    topicPrefix: process.env.EXPO_PUBLIC_MQTT_TOPIC_PREFIX,
  };
}

// Feed system topic helpers
export const FEED_TOPICS = {
  COMMAND: 'aquarium/feed/command',
  STATUS: 'aquarium/feed/status',
  SCHEDULE: 'aquarium/feed/schedule',
} as const;

export function createFeedCommandMessage(amount?: number): FeedCommandMessage {
  return {
    type: 'feed_command',
    amount,
    timestamp: new Date().toISOString(),
  };
}

export function createFeedStatusMessage(success: boolean, amount?: number, error?: string): FeedStatusMessage {
  return {
    type: 'feed_status',
    success,
    amount,
    timestamp: new Date().toISOString(),
    error,
  };
}

export function createFeedScheduleMessage(
  enabled: boolean,
  intervalMinutes: number,
  amount: number,
  nextFeedTime?: Date
): FeedScheduleMessage {
  return {
    type: 'feed_schedule',
    enabled,
    intervalMinutes,
    amount,
    nextFeedTime: nextFeedTime?.toISOString(),
  };
}

export function parseFeedMessage(payload: string | Uint8Array): FeedCommandMessage | FeedStatusMessage | FeedScheduleMessage | null {
  try {
    const payloadStr = typeof payload === 'string' ? payload : new TextDecoder().decode(payload);
    const data = JSON.parse(payloadStr);

    if (data.type === 'feed_command') {
      return data as FeedCommandMessage;
    } else if (data.type === 'feed_status') {
      return data as FeedStatusMessage;
    } else if (data.type === 'feed_schedule') {
      return data as FeedScheduleMessage;
    }

    return null;
  } catch {
    return null;
  }
}
