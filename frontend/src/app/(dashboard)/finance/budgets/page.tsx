import type { Metadata } from "next";
import { BudgetsPage } from "@/features/budget/components/BudgetsPage";

export const metadata: Metadata = { title: "Budgets · rm-diagram" };

export default function Page() {
  return <BudgetsPage />;
}
