"use client";

import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import { useSidebarStore } from "@/stores/sidebar";
import { useHabitReminders } from "@/features/habit/useHabitReminders";
import { cn } from "@/lib/utils";

function ReminderRunner() {
  useHabitReminders();
  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isOpen = useSidebarStore((s) => s.isOpen);

  return (
    <AuthGuard>
      <ReminderRunner />
      <div className="min-h-svh flex">
        <Sidebar />
        <div
          className={cn(
            "flex min-h-svh flex-1 flex-col transition-all duration-300",
            isOpen ? "ml-sidebar" : "ml-sidebar-collapsed",
          )}
        >
          <Navbar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
