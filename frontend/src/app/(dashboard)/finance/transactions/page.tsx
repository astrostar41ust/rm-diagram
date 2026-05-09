import type { Metadata } from "next";
import { TransactionList } from "@/features/finance/components/TransactionList";

export const metadata: Metadata = { title: "Transactions · rm-diagram" };

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">All income and expense records.</p>
      </div>

      <TransactionList />
    </div>
  );
}
