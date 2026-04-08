"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

type ClickEvent = {
  id: string;
  linkId: string;
  country: string | null;
  clicks: number;
  timestamp: number;
};

type NotificationContextType = {
  events: ClickEvent[];
  unreadCount: number;
  markAllRead: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken } = useAuth();
  const [events, setEvents] = useState<ClickEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let sources: EventSource[] = [];
    let isActive = true;

    async function init() {
      const token = await getToken({ template: "edge" });
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/links`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const links = data.links || [];

      if (!isActive) return;

      const lastClicks = new Map<string, number>();

      sources = links.map((link: any) => {
        const source = new EventSource(
          `${process.env.NEXT_PUBLIC_API_URL}/analytics/live/${link.id}`,
        );

        source.onmessage = (event) => {
          const payload = JSON.parse(event.data);
          const currentCount = payload.clicks;
          const previousCount = lastClicks.get(link.id) ?? 0;

          if (currentCount > previousCount && payload.country) {
            const newEvent: ClickEvent = {
              id: Math.random().toString(36).substr(2, 9),
              linkId: link.id,
              country: payload.country,
              clicks: currentCount,
              timestamp: Date.now(),
            };

            setEvents((prev) => [newEvent, ...prev].slice(0, 10));
            setUnreadCount((c) => c + 1);
            toast.success(`Click received from ${payload.country}`);
          }

          lastClicks.set(link.id, currentCount);
        };

        return source;
      });
    }

    init();

    return () => {
      isActive = false;
      sources.forEach((s) => s.close());
    };
  }, []);

  const markAllRead = () => setUnreadCount(0);

  return (
    <NotificationContext.Provider value={{ events, unreadCount, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}
