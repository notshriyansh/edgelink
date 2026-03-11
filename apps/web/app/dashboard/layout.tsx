import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardTopNav } from "@/components/dashboard-topnav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <div className="flex flex-1 flex-col">
        <DashboardTopNav />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
