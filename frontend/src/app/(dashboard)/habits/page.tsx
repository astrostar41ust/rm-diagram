import type { Metadata } from "next";
import { HabitGrid } from "@/features/habit/components/HabitGrid";

export const metadata: Metadata = { title: "Habits · rm-diagram" };

export default function HabitsPage() {
  return <HabitGrid />;
}
