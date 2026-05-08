export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">Track what you&apos;re working towards.</p>
        </div>
        <button className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
          Add goal
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {goals.map((g) => (
          <div key={g.title} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{g.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[g.status]}`}
              >
                {statusLabels[g.status]}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Target: {g.targetDate}</span>
              <span>{g.progress}% complete</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${g.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const statusStyles: Record<string, string> = {
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  not_started: "bg-muted text-muted-foreground",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const statusLabels: Record<string, string> = {
  in_progress: "In progress",
  not_started: "Not started",
  completed: "Completed",
};

const goals = [
  { title: "Save $10,000", description: "Emergency fund target", targetDate: "Dec 2026", status: "in_progress", progress: 45 },
  { title: "Run a marathon", description: "Full 42km marathon", targetDate: "Oct 2026", status: "in_progress", progress: 30 },
  { title: "Read 24 books", description: "2 books per month", targetDate: "Dec 2026", status: "in_progress", progress: 38 },
  { title: "Learn TypeScript", description: "Complete advanced TS course", targetDate: "Mar 2026", status: "completed", progress: 100 },
  { title: "Build side project", description: "Ship rm-diagram v1", targetDate: "Jul 2026", status: "in_progress", progress: 20 },
  { title: "Learn piano", description: "Play 3 full songs", targetDate: "Sep 2026", status: "not_started", progress: 0 },
];
