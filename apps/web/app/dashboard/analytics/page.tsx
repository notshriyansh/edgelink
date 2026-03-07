"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  useEffect(() => {
    async function loadAnalytics() {
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
    }

    loadAnalytics();
  }, []);

  const clicksOverTime = Object.values(
    clicks.reduce((acc: any, click) => {
      const day = new Date(click.created_at).toLocaleDateString();

      if (!acc[day]) {
        acc[day] = { day, clicks: 0 };
      }

      acc[day].clicks++;

      return acc;
    }, {}),
  );

  const deviceStats = Object.values(
    clicks.reduce((acc: any, click) => {
      if (!acc[click.device]) {
        acc[click.device] = { device: click.device, clicks: 0 };
      }

      acc[click.device].clicks++;

      return acc;
    }, {}),
  );

  const countryStats = Object.values(
    clicks.reduce((acc: any, click) => {
      if (!acc[click.country]) {
        acc[click.country] = { country: click.country, clicks: 0 };
      }

      acc[click.country].clicks++;

      return acc;
    }, {}),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-gray-500">
          Performance insights for this link
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Clicks Over Time</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clicksOverTime}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <defs>
                    <linearGradient
                      id="colorClicks"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#colorClicks)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clicks by Device</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deviceStats}>
                  <XAxis dataKey="device" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Clicks by Country</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryStats}>
                  <XAxis dataKey="country" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
