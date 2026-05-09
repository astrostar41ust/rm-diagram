import type { Metadata } from "next";
import { GoalList } from "@/features/goal/components/GoalList";

export const metadata: Metadata = { title: "Goals · rm-diagram" };

export default function GoalsPage() {
  return <GoalList />;
}
