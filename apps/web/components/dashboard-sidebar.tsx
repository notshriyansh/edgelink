"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Plus,
  Link2,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
  Globe2
} from "lucide-react";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const items = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Create Link", href: "/dashboard/new", icon: Plus },
  { name: "My Links", href: "/dashboard/links", icon: Link2 },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ width: 240 }}
      animate={{ width: collapsed ? 76 : 240 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="border-r border-border/40 bg-sidebar/50 backdrop-blur-3xl h-screen flex flex-col shadow-[1px_0_20px_0_rgba(0,0,0,0.03)] dark:shadow-none z-40"
    >
      <div className="flex items-center justify-between p-4 mb-2 h-16 border-b border-border/20">
        <AnimatePresence mode="popLayout">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
                <Globe2 size={16} strokeWidth={2.5} />
              </div>
              <h2 className="font-semibold tracking-tight text-lg truncate pr-2">LinkScope</h2>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={`shrink-0 text-muted-foreground hover:text-foreground transition-all duration-300 ${!collapsed ? "ml-auto" : "mx-auto"}`}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </Button>
      </div>

      <nav className="space-y-1.5 flex-1 px-3 py-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');

          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ scale: 0.98 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative overflow-hidden ${
                  active
                    ? "text-primary font-medium shadow-soft bg-primary/10"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                } ${collapsed ? "justify-center" : ""}`}
              >
                {/* Active indicator bar */}
                {active && !collapsed && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}

                <Icon
                  size={18}
                  className={`transition-colors duration-200 shrink-0 ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
                />

                <AnimatePresence mode="popLayout">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-4 m-3 mt-auto bg-card/40 border border-border/30 rounded-xl overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-medium text-foreground">Edge Network Active</p>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Routing clicks via Cloudflare global network
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
