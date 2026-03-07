"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Stats = {
  totalLinks: number;
  totalClicks: number;
  clicksToday: number;
};

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalLinks: 0,
    totalClicks: 0,
    clicksToday: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const token = await getToken({ template: "edge" });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setStats(data);
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Overview of your link performance
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle>Total Links</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{stats.totalLinks}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle>Total Clicks</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{stats.totalClicks}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle>Clicks Today</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{stats.clicksToday}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
