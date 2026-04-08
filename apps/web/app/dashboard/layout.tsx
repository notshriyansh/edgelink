import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardTopNav } from "@/components/dashboard-topnav";
import { NotificationProvider } from "@/components/notifications-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <DashboardSidebar />

        <div className="flex flex-1 flex-col overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none -z-10" />

          <DashboardTopNav />

          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              {children}
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}
