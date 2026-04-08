"use client";

import { useEffect, useState } from "react";
import { Search, Bell, Sun, Moon, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { UserButton } from "@clerk/nextjs";
import { useNotifications } from "@/components/notifications-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardTopNav() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { events, unreadCount, markAllRead } = useNotifications();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border/40 bg-background/60 backdrop-blur-xl flex items-center justify-between px-6 shadow-sm transition-all">
      <div className="relative w-full max-w-md hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
        <Input
          placeholder="Search links..."
          className="pl-9 bg-background/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary shadow-soft"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <DropdownMenu onOpenChange={(open) => open && markAllRead()}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full hover:bg-accent/50 transition-colors"
            >
              <Bell className="size-4.5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex size-2.5 items-center justify-center rounded-full bg-primary ring-2 ring-background">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 shadow-soft-dark border-border/50 bg-glass"
          >
            <DropdownMenuLabel className="flex justify-between items-center px-4 py-2">
              <span className="font-medium">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <div className="max-h-75 overflow-y-auto">
              {events.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No recent activity
                </div>
              ) : (
                events.map((event) => (
                  <DropdownMenuItem
                    key={event.id}
                    className="gap-3 px-4 py-3 cursor-default focus:bg-accent/50 rounded-none border-b border-border/30 last:border-0 hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CheckCircle2 className="size-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium leading-none">
                        {event.country
                          ? `${event.country} clicked your link`
                          : "New click on your link"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-accent/50 transition-colors"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="size-4.5 text-muted-foreground" />
            ) : (
              <Moon className="size-4.5 text-muted-foreground" />
            )}
          </Button>
        )}

        <div className="pl-2 ml-2 border-l border-border/50">
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "size-8 rounded-full border border-border/50 shadow-sm transition-transform hover:scale-105",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
