"use client";

import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import { useSidebarStore } from "@/stores/sidebar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isOpen = useSidebarStore((s) => s.isOpen);

  return (
    <div className="min-h-svh">
      <Sidebar />
      <div
        className={cn(
          "flex flex-col transition-all duration-300",
          isOpen ? "ml-sidebar" : "ml-sidebar-collapsed",
        )}
      >
        <Navbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
