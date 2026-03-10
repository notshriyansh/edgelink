"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Plus,
  Link2,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { usePathname } from "next/navigation";

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
      animate={{ width: collapsed ? 70 : 240 }}
      transition={{ duration: 0.2 }}
      className="border-r h-screen bg-sidebar p-3 flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        {!collapsed && (
          <h2 className="font-semibold tracking-tight text-lg">LinkScope</h2>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-accent rounded transition"
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      <nav className="space-y-2 flex-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150 ${
                active ? "bg-accent font-medium" : "hover:bg-accent/70"
              }`}
            >
              <Icon
                size={18}
                className="transition-transform group-hover:scale-110"
              />

              {!collapsed && item.name}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <p className="text-xs text-muted-foreground mt-6 px-2">
          Edge-powered link analytics
        </p>
      )}
    </motion.aside>
  );
}
