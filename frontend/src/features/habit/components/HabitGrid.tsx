"use client";

import { useState, useMemo, useCallback } from "react";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  eachDayOfInterval,
  format,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHabitGrid, useToggleCompletion } from "../hooks";
import { HabitRow } from "./HabitRow";
import { HabitWeekCard } from "./HabitWeekCard";
import { HabitMonthCard } from "./HabitMonthCard";
import { AddHabitSheet } from "./AddHabitSheet";
import { HabitAnalyticsSheet } from "./HabitAnalyticsSheet";

type ViewMode = "today" | "week" | "month";

export function HabitGrid() {
  const [view, setView] = useState<ViewMode>("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [analyticsHabit, setAnalyticsHabit] = useState<{
    id: number;
    color: string | null;
  } | null>(null);

  const { from, to, days } = useMemo(() => {
    let start: Date;
    let end: Date;
    if (view === "today") {
      start = new Date();
      end = new Date();
    } else if (view === "week") {
      start = startOfWeek(anchor, { weekStartsOn: 1 });
      end = endOfWeek(anchor, { weekStartsOn: 1 });
    } else {
      start = startOfMonth(anchor);
      end = endOfMonth(anchor);
    }
    return {
      from: format(start, "yyyy-MM-dd"),
      to: format(end, "yyyy-MM-dd"),
      days: eachDayOfInterval({ start, end }),
    };
  }, [view, anchor]);

  const { data, isLoading } = useHabitGrid(from, to);
  const toggle = useToggleCompletion(from, to);

  const handleToggle = useCallback(
    (habitId: number, date: string) => {
      toggle.mutate({ habitId, date });
    },
    [toggle],
  );

  const navigate = useCallback(
    (dir: 1 | -1) => {
      setAnchor((prev) => {
        if (view === "week") return dir === 1 ? addWeeks(prev, 1) : subWeeks(prev, 1);
        return dir === 1 ? addMonths(prev, 1) : subMonths(prev, 1);
      });
    },
    [view],
  );

  const today = format(new Date(), "yyyy-MM-dd");
  const habits = data?.habits ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Habits</h1>
          <p className="text-muted-foreground">Track your daily routines.</p>
        </div>
        <Button onClick={() => setSheetOpen(true)}>
          <Plus className="size-4" data-icon="inline-start" />
          Add habit
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-border p-1">
          {(["today", "week", "month"] as const).map((v) => (
            <button
              key={v}
              onClick={() => {
                setView(v);
                setAnchor(new Date());
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                view === v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v}
            </button>
          ))}
        </div>

        {view !== "today" && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon-sm" onClick={() => navigate(-1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[10rem] text-center text-sm font-medium tabular-nums">
              {view === "week"
                ? `${format(days[0], "MMM d")} – ${format(days[days.length - 1], "MMM d")}`
                : format(anchor, "MMMM yyyy")}
            </span>
            <Button variant="outline" size="icon-sm" onClick={() => navigate(1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <SkeletonList view={view} />
      ) : habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">No habits yet.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setSheetOpen(true)}
          >
            <Plus className="size-4" data-icon="inline-start" />
            Create your first habit
          </Button>
        </div>
      ) : view === "today" ? (
        <div className="space-y-3">
          {habits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              today={today}
              onToggle={handleToggle}
            />
          ))}
        </div>
      ) : view === "week" ? (
        <div className="space-y-3">
          {habits.map((habit) => (
            <HabitWeekCard
              key={habit.id}
              habit={habit}
              days={days}
              onToggle={handleToggle}
              onOpenAnalytics={setAnalyticsHabit}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {habits.map((habit) => (
            <HabitMonthCard
              key={habit.id}
              habit={habit}
              anchor={anchor}
              onToggle={handleToggle}
              onOpenAnalytics={setAnalyticsHabit}
            />
          ))}
        </div>
      )}

      <AddHabitSheet open={sheetOpen} onOpenChange={setSheetOpen} />
      <HabitAnalyticsSheet
        habitId={analyticsHabit?.id ?? null}
        habitColor={analyticsHabit?.color}
        onOpenChange={(o) => !o && setAnalyticsHabit(null)}
      />
    </div>
  );
}

function SkeletonList({ view }: { view: ViewMode }) {
  if (view === "month") {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className={view === "week" ? "h-28" : "h-14"} />
      ))}
    </div>
  );
}
