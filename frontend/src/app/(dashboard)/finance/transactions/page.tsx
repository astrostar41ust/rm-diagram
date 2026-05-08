export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">All income and expense records.</p>
        </div>
        <button className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
          Add transaction
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.description + r.date} className="hover:bg-muted/50">
                <td className="px-5 py-3 font-medium">{r.description}</td>
                <td className="px-5 py-3 text-muted-foreground">{r.category}</td>
                <td className="px-5 py-3 text-muted-foreground">{r.date}</td>
                <td
                  className={
                    r.type === "income"
                      ? "px-5 py-3 text-right font-medium text-green-600"
                      : "px-5 py-3 text-right font-medium text-red-500"
                  }
                >
                  {r.type === "income" ? "+" : "-"}${r.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const rows = [
  { description: "Salary", category: "Income", date: "May 1", amount: "4,250.00", type: "income" },
  { description: "Rent", category: "Housing", date: "May 1", amount: "1,200.00", type: "expense" },
  { description: "Groceries", category: "Food", date: "May 3", amount: "85.40", type: "expense" },
  { description: "Electric bill", category: "Utilities", date: "May 4", amount: "62.00", type: "expense" },
  { description: "Netflix", category: "Entertainment", date: "May 5", amount: "15.99", type: "expense" },
  { description: "Freelance project", category: "Income", date: "May 6", amount: "500.00", type: "income" },
  { description: "Gas", category: "Transport", date: "May 7", amount: "45.00", type: "expense" },
  { description: "Dinner out", category: "Food", date: "May 8", amount: "38.50", type: "expense" },
];
