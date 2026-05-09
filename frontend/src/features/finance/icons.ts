import {
  Briefcase,
  Car,
  DollarSign,
  Film,
  Gift,
  GraduationCap,
  HeartPulse,
  Laptop,
  Package,
  Receipt,
  ShoppingBag,
  Tag,
  TrendingUp,
  Utensils,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  "shopping-bag": ShoppingBag,
  receipt: Receipt,
  film: Film,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  package: Package,
  briefcase: Briefcase,
  laptop: Laptop,
  "trending-up": TrendingUp,
  gift: Gift,
  "dollar-sign": DollarSign,
};

export function categoryIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Tag;
  return ICON_MAP[name] ?? Tag;
}
