import type { Metadata } from "next";
import { TransactionList } from "@/features/finance/components/TransactionList";
import { MonthlyChart } from "@/features/finance/components/MonthlyChart";

export const metadata: Metadata = { title: "Finance · rm-diagram" };

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
        <p className="text-muted-foreground">
          Track income and expenses by category.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TransactionList />
        <MonthlyChart />
      </div>
    </div>
  );
}
