"use client";

import Link from "next/link";
import { LayoutDashboard, Plus, Link2, BarChart3 } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Create Link",
    href: "/dashboard/new",
    icon: Plus,
  },
  {
    name: "My Links",
    href: "/dashboard/links",
    icon: Link2,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 border-r bg-sidebar h-screen p-4">
      <h2 className="font-semibold mb-6">EdgeLink</h2>

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
              <Icon size={16} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
