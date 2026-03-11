"use client";

import { useEffect, useState } from "react";
import { Search, Bell, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { UserButton } from "@clerk/nextjs";

export function DashboardTopNav() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 border-b bg-background/80 backdrop-blur flex items-center justify-between px-6">
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search links..."
          className="pl-9 bg-muted border border-border"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 hover:bg-accent rounded-md">
          <Bell className="size-5" />
          <span className="absolute right-1 top-1 size-2 bg-blue-500 rounded-full" />
        </button>

        {mounted && (
          <button
            className="p-2 hover:bg-accent rounded-md"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        <UserButton />
      </div>
    </header>
  );
}
