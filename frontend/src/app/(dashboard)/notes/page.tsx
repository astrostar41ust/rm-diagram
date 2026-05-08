export default function NotesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">Daily thoughts and reflections.</p>
        </div>
        <button className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
          New note
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((n) => (
          <div
            key={n.title}
            className="flex flex-col rounded-xl border border-border bg-card p-5 hover:border-foreground/20 transition-colors cursor-pointer"
          >
            <p className="text-xs text-muted-foreground">{n.date}</p>
            <p className="mt-1 font-medium">{n.title}</p>
            <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
              {n.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const notes = [
  {
    title: "Morning reflection",
    date: "May 9, 2026",
    content: "Woke up early and went for a run. Feeling energized. Need to focus on the finance module today and wrap up the API endpoints.",
  },
  {
    title: "Project ideas",
    date: "May 8, 2026",
    content: "Consider adding a calendar view for habits. Also think about integrating with Google Calendar for goal deadlines. Maybe add chart visualizations for finance.",
  },
  {
    title: "Book notes: Atomic Habits",
    date: "May 7, 2026",
    content: "Key takeaway: focus on systems, not goals. Make good habits obvious, attractive, easy, and satisfying. The 1% improvement compounds over time.",
  },
  {
    title: "Weekly review",
    date: "May 5, 2026",
    content: "Completed 5 out of 7 daily habits this week. Spending was under budget except for food. Need to meal prep more. Marathon training on track.",
  },
  {
    title: "Meal prep plan",
    date: "May 4, 2026",
    content: "Sunday: prep chicken, rice, and vegetables for the week. Budget $50 for groceries. Try the new lentil soup recipe from the cookbook.",
  },
  {
    title: "Gratitude log",
    date: "May 3, 2026",
    content: "Grateful for the quiet morning, a good conversation with a friend, and making progress on the side project. Small wins add up.",
  },
];
