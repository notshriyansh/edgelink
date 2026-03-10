"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

type Click = {
  country: string;
  device: string;
  created_at: number;
};

export default function AnalyticsPage() {
  const { getToken } = useAuth();
  const params = useParams();

  const linkId = params.linkId as string;

  const [clicks, setClicks] = useState<Click[]>([]);
  const [liveClicks, setLiveClicks] = useState<number>(0);

  useEffect(() => {
    async function load() {
      const token = await getToken({ template: "edge" });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/${linkId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      setClicks(data.clicks || []);
      setLiveClicks(data.clicks?.length || 0);
    }

    load();
  }, []);

  useEffect(() => {
    const source = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/analytics/live/${linkId}`,
    );

    source.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLiveClicks(data.clicks);
    };

    return () => source.close();
  }, []);

  const clicksOverTime = Object.values(
    clicks.reduce((acc: any, click) => {
      const day = new Date(click.created_at).toLocaleDateString();

      if (!acc[day]) acc[day] = { day, clicks: 0 };

      acc[day].clicks++;

      return acc;
    }, {}),
  );

  const deviceStats = Object.values(
    clicks.reduce((acc: any, click) => {
      if (!acc[click.device])
        acc[click.device] = { device: click.device, clicks: 0 };

      acc[click.device].clicks++;

      return acc;
    }, {}),
  );

  const countryStats = Object.values(
    clicks.reduce((acc: any, click) => {
      if (!acc[click.country])
        acc[click.country] = { country: click.country, clicks: 0 };

      acc[click.country].clicks++;

      return acc;
    }, {}),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          Live clicks:
          <span className="font-semibold text-primary animate-pulse">
            {liveClicks}
          </span>
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Clicks Over Time</h2>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={clicksOverTime}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="clicks" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Clicks by Device</h2>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviceStats}>
                <XAxis dataKey="device" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clicks" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border rounded-lg p-6 lg:col-span-2">
          <h2 className="font-semibold mb-4">Clicks by Country</h2>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryStats}>
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clicks" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
