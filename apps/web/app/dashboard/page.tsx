"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  MousePointerClick,
  TrendingUp,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import GeoMap from "@/components/geomap";

type Stats = {
  totalLinks: number;
  totalClicks: number;
  clicksToday: number;
};

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [clicksOverTime, setClicksOverTime] = useState<any[]>([]);
  const [countryStats, setCountryStats] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const token = await getToken({ template: "edge" });

      const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();
      setStats(statsData);

      const linksRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/links`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const linksData = await linksRes.json();
      const links = linksData.links || [];

      const allClicks: any[] = [];

      for (const link of links) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/analytics/${link.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await res.json();
        allClicks.push(...(data.clicks || []));
      }

      const groupedByDay = Object.values(
        allClicks.reduce((acc: any, click) => {
          const day = new Date(click.created_at).toLocaleDateString();

          if (!acc[day]) acc[day] = { day, clicks: 0 };

          acc[day].clicks++;
          return acc;
        }, {}),
      );

      setClicksOverTime(groupedByDay);

      const groupedByCountry = Object.values(
        allClicks.reduce((acc: any, click) => {
          const country = click.country || "unknown";

          if (!acc[country]) {
            acc[country] = { country, clicks: 0 };
          }

          acc[country].clicks++;
          return acc;
        }, {}),
      );

      setCountryStats(groupedByCountry);
    }

    load();
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-100 md:col-span-2 rounded-xl" />
        <Skeleton className="h-100 rounded-xl" />
      </div>
    );
  }

  const cards = [
    {
      title: "Total Links",
      value: stats.totalLinks,
      icon: Link2,
      trend: "+12%",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Total Clicks",
      value: stats.totalClicks,
      icon: MousePointerClick,
      trend: "+24%",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      title: "Clicks Today",
      value: stats.clicksToday,
      icon: Clock,
      trend: "+4%",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-semibold tracking-tight"
        >
          Overview
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-muted-foreground mt-1"
        >
          Monitor your link performance across the edge.
        </motion.p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <AnimatePresence>
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              >
                <Card className="relative overflow-hidden group hover:shadow-soft-dark transition-all duration-300 border-border/40 bg-card/60 backdrop-blur">
                  <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="pb-2 flex flex-row items-center relative z-10 space-y-0 text-muted-foreground">
                    <CardTitle className="text-sm font-medium">
                      {card.title}
                    </CardTitle>
                    <div className={`ml-auto p-2 rounded-lg ${card.bg}`}>
                      <Icon className={`size-4 ${card.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-2 flex items-baseline gap-3">
                    <p className="text-3xl font-bold tracking-tight text-foreground">
                      {card.value.toLocaleString()}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`${card.color} ${card.bg} border-0 hover:bg-transparent font-medium`}
                    >
                      <TrendingUp className="mr-1 size-3" /> {card.trend}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="lg:col-span-2 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 shadow-sm flex flex-col min-h-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-lg tracking-tight">
                Clicks Over Time
              </h2>
              <span className="text-sm text-muted-foreground">
                Last 14 days performance
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex shadow-soft"
            >
              View Report
            </Button>
          </div>

          <div className="flex-1 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={clicksOverTime}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--primary)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    boxShadow: "0 4px 20px -2px rgb(0 0 0 / 0.1)",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                  cursor={{
                    stroke: "var(--border)",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorClicks)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "var(--primary)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="lg:col-span-1 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-lg tracking-tight">
                Global Traffic
              </h2>
              <span className="text-sm text-muted-foreground">Top regions</span>
            </div>
          </div>

          <div className="flex-1 w-full flex items-center justify-center relative rounded-xl overflow-hidden bg-dot-pattern bg-background/50 border border-border/30">
            <div className="w-full h-full flex items-center justify-center">
              <GeoMap data={countryStats} />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-lg tracking-tight flex items-center gap-2">
            Top Performing Links{" "}
            <Badge variant="secondary" className="ml-2 font-mono font-medium">
              ✨ PRO (Coming Soon)
            </Badge>
          </h2>
          <Button variant="ghost" size="sm" className="text-sm">
            View All Links <ExternalLink className="ml-2 size-4" />
          </Button>
        </div>
        <div className="text-center py-10 px-4 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-muted-foreground text-sm font-medium">
            Connect a premium account to unlock detailed link tracking insights.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
