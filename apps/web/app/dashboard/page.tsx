"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your link performance
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="transition hover:shadow-xl hover:-translate-y-1 cursor-default">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  {card.title}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <motion.p
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold tracking-tight"
                >
                  {card.value}
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
