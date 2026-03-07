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
      className="border-r h-screen bg-sidebar p-3"
    >
      <div className="flex items-center justify-between mb-6">
        {!collapsed && <h2 className="font-semibold">EdgeLink</h2>}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-accent rounded"
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;

          const active = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                active ? "bg-accent font-medium" : "hover:bg-accent"
              }`}
            >
              <Icon size={18} />

              {!collapsed && item.name}
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
