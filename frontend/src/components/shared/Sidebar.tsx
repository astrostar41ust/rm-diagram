"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Wallet,
  Target,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/habits", label: "Habits", icon: ListChecks },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/notes", label: "Notes", icon: StickyNote },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const isOpen = useSidebarStore((s) => s.isOpen);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-card transition-all duration-300",
        isOpen ? "w-sidebar" : "w-sidebar-collapsed",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b border-border px-4",
          isOpen ? "justify-start" : "justify-center",
        )}
      >
        <span className="text-lg font-bold tracking-tight text-foreground">
          {isOpen ? "rm-diagram" : "rm"}
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                !isOpen && "justify-center px-0",
              )}
            >
              <Icon className="size-5 shrink-0" />
              {isOpen && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
