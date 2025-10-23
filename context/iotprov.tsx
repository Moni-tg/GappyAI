import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { IotClient, IotConnectionStatus, IotMessage, readIotEnv, type IotConfig, FeedStatusMessage, createFeedCommandMessage, parseFeedMessage, FEED_TOPICS } from "../services/iot";

export type IotContextType = {
  status: IotConnectionStatus;
  lastError: string | null;
  messages: IotMessage[];
  connect: (config?: IotConfig) => Promise<void>;
  disconnect: () => Promise<void>;
  publish: (msg: IotMessage) => Promise<void>;
  subscribe: (topic: string) => Promise<void>;
  unsubscribe: (topic: string) => Promise<void>;
  clearMessages: () => void;
  sendFeedCommand: (amount?: number) => Promise<void>;
  onFeedStatus: (callback: (status: FeedStatusMessage) => void) => () => void;
};

const IotContext = createContext<IotContextType | undefined>(undefined);

export function useIot() {
  const ctx = useContext(IotContext);
  if (!ctx) throw new Error("useIot must be used within an IotProvider");
  return ctx;
}

export function IotProvider({ children }: { children: React.ReactNode }) {
  const clientRef = useRef(new IotClient());
  const [status, setStatus] = useState<IotConnectionStatus>("disconnected");
  const [lastError, setLastError] = useState<string | null>(null);
  const [messages, setMessages] = useState<IotMessage[]>([]);

  // Wire message handler once
  useEffect(() => {
    clientRef.current.onMessage((msg) => {
      setMessages((prev) => [msg, ...prev].slice(0, 200));
    });
  }, []);

  const connect = async (config?: IotConfig) => {
    setLastError(null);
    setStatus("connecting");
    try {
      const effective = config ?? readIotEnv();
      if (!effective) throw new Error("Missing IoT config (EXPO_PUBLIC_MQTT_URL)");
      await clientRef.current.connect(effective);
      setStatus("connected");
    } catch (e: any) {
      setStatus("error");
      setLastError(e?.message ?? "Unknown IoT connect error");
    }
  };

  const disconnect = async () => {
    try {
      await clientRef.current.disconnect();
    } finally {
      setStatus("disconnected");
    }
  };

  const publish = async (msg: IotMessage) => {
    await clientRef.current.publish(msg);
  };

  const subscribe = async (topic: string) => {
    await clientRef.current.subscribe(topic);
  };

  const unsubscribe = async (topic: string) => {
    await clientRef.current.unsubscribe(topic);
  };

  const clearMessages = () => setMessages([]);

  const sendFeedCommand = async (amount?: number) => {
    const message = createFeedCommandMessage(amount);
    await publish({
      topic: FEED_TOPICS.COMMAND,
      payload: JSON.stringify(message),
    });
  };

  const feedStatusCallbacks = useRef(new Set<(status: FeedStatusMessage) => void>());

  const onFeedStatus = (callback: (status: FeedStatusMessage) => void) => {
    feedStatusCallbacks.current.add(callback);
    return () => {
      feedStatusCallbacks.current.delete(callback);
    };
  };

  // Enhanced message handler to process feed status messages
  useEffect(() => {
    clientRef.current.onMessage((msg) => {
      setMessages((prev) => [msg, ...prev].slice(0, 200));

      // Process feed status messages
      if (msg.topic === FEED_TOPICS.STATUS) {
        const feedStatus = parseFeedMessage(msg.payload);
        if (feedStatus && feedStatus.type === 'feed_status') {
          feedStatusCallbacks.current.forEach(callback => callback(feedStatus));
        }
      }
    });
  }, []);

  const value: IotContextType = useMemo(
    () => ({ status, lastError, messages, connect, disconnect, publish, subscribe, unsubscribe, clearMessages, sendFeedCommand, onFeedStatus }),
    [status, lastError, messages]
  );

  // Auto-connect if env config exists
  useEffect(() => {
    const cfg = readIotEnv();
    if (cfg) {
      connect(cfg).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <IotContext.Provider value={value}>{children}</IotContext.Provider>;
}
