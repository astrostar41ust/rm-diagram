import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ListChecks,
  Wallet,
  ArrowLeftRight,
  PiggyBank,
  Target,
  StickyNote,
} from "lucide-react";

export interface SidebarChildItem {
  href: string;
  label: string;
  icon?: LucideIcon;
}

export interface SidebarItem {
  key: string;
  href: string;
  label: string;
  icon: LucideIcon;
  children?: SidebarChildItem[];
}

export type SidebarConfig = readonly SidebarItem[];

export const sidebarConfig: SidebarConfig = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "habits", href: "/habits", label: "Habits", icon: ListChecks },
  {
    key: "finance",
    href: "/finance",
    label: "Finance",
    icon: Wallet,
    children: [
      { href: "/finance/transactions", label: "Transactions", icon: ArrowLeftRight },
      { href: "/finance/budgets", label: "Budgets", icon: PiggyBank },
    ],
  },
  { key: "goals", href: "/goals", label: "Goals", icon: Target },
  { key: "notes", href: "/notes", label: "Notes", icon: StickyNote },
];
