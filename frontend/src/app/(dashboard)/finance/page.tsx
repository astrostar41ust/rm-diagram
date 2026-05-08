export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
        <p className="text-muted-foreground">Overview of your income and expenses.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Income</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">$4,250.00</p>
          <p className="mt-1 text-xs text-muted-foreground">this month</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Expenses</p>
          <p className="mt-1 text-2xl font-semibold text-red-500">$2,180.00</p>
          <p className="mt-1 text-xs text-muted-foreground">this month</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Net balance</p>
          <p className="mt-1 text-2xl font-semibold">$2,070.00</p>
          <p className="mt-1 text-xs text-muted-foreground">this month</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <h2 className="font-medium">Recent transactions</h2>
        </div>
        <div className="divide-y divide-border">
          {transactions.map((t) => (
            <div key={t.description} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium">{t.description}</p>
                <p className="text-xs text-muted-foreground">{t.category} &middot; {t.date}</p>
              </div>
              <p
                className={
                  t.type === "income"
                    ? "text-sm font-medium text-green-600"
                    : "text-sm font-medium text-red-500"
                }
              >
                {t.type === "income" ? "+" : "-"}${t.amount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const transactions = [
  { description: "Salary", category: "Income", date: "May 1", amount: "4,250.00", type: "income" },
  { description: "Rent", category: "Housing", date: "May 1", amount: "1,200.00", type: "expense" },
  { description: "Groceries", category: "Food", date: "May 3", amount: "85.40", type: "expense" },
  { description: "Netflix", category: "Entertainment", date: "May 5", amount: "15.99", type: "expense" },
  { description: "Freelance project", category: "Income", date: "May 6", amount: "500.00", type: "income" },
];
