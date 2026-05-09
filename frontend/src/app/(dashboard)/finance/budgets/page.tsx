import type { Metadata } from "next";

export const metadata: Metadata = { title: "Budgets · rm-diagram" };

export default function BudgetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Set spending limits by category.</p>
        </div>
        <button className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
          Add budget
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {budgets.map((b) => {
          const pct = Math.round((b.spent / b.limit) * 100);
          const over = pct > 100;
          return (
            <div key={b.category} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="font-medium">{b.category}</p>
                <p className={over ? "text-xs font-medium text-red-500" : "text-xs text-muted-foreground"}>
                  {pct}%
                </p>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted">
                <div
                  className={over ? "h-2 rounded-full bg-red-500" : "h-2 rounded-full bg-primary"}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                ${b.spent.toFixed(2)} of ${b.limit.toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const budgets = [
  { category: "Food", limit: 400, spent: 123.9 },
  { category: "Housing", limit: 1200, spent: 1200 },
  { category: "Transport", limit: 150, spent: 45 },
  { category: "Entertainment", limit: 100, spent: 15.99 },
  { category: "Utilities", limit: 200, spent: 62 },
  { category: "Shopping", limit: 300, spent: 340 },
];
