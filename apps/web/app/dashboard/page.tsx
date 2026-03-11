"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import GeoMap from "@/components/geomap";

type Stats = {
  totalLinks: number;
  totalClicks: number;
  clicksToday: number;
};

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function loadStats() {
      const token = await getToken({ template: "edge" });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setStats(data);
    }

    loadStats();
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-3 gap-6">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    );
  }

  const cards = [
    { title: "Total Links", value: stats.totalLinks },
    { title: "Total Clicks", value: stats.totalClicks },
    { title: "Clicks Today", value: stats.clicksToday },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your link performance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-27.5 flex flex-col justify-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {card.title}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-3xl font-bold tracking-tight">
                  {card.value}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Global Traffic</h2>
          <span className="text-sm text-muted-foreground">
            Click distribution
          </span>
        </div>

        <div className="h-105 w-full">
          <GeoMap data={[{ country: "IN", clicks: stats.totalClicks }]} />
        </div>
      </div>
    </div>
  );
}
