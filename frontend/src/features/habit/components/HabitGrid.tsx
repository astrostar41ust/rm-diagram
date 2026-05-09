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
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHabitGrid, useToggleCompletion } from "../hooks";
import { HabitCell } from "./HabitCell";
import { HabitRow } from "./HabitRow";
import { AddHabitSheet } from "./AddHabitSheet";

type ViewMode = "today" | "week" | "month";

function isScheduledOn(
  frequencyType: string,
  scheduleDays: string | null,
  date: Date,
): boolean {
  if (frequencyType === "DAILY") return true;
  if (frequencyType === "SPECIFIC_DAYS" && scheduleDays) {
    const dayName = format(date, "EEEE").toUpperCase();
    return scheduleDays
      .split(",")
      .map((d) => d.trim().toUpperCase())
      .includes(dayName);
  }
  return true;
}

export function HabitGrid() {
  const [view, setView] = useState<ViewMode>("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const [sheetOpen, setSheetOpen] = useState(false);

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

      <div className="flex items-center justify-between">
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
            <span className="min-w-[8rem] text-center text-sm font-medium">
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
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
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
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="sticky left-0 z-10 bg-card px-4 py-3 text-left text-sm font-medium">
                  Habit
                </th>
                {days.map((day) => {
                  const key = format(day, "yyyy-MM-dd");
                  return (
                    <th
                      key={key}
                      className={cn(
                        "px-1 py-3 text-center text-xs font-medium",
                        isToday(day) && "bg-purple-50 dark:bg-purple-950/30",
                      )}
                    >
                      <div>{format(day, "EEE")}</div>
                      <div className="text-muted-foreground">
                        {format(day, "d")}
                      </div>
                    </th>
                  );
                })}
                <th className="px-3 py-3 text-center text-xs font-medium">
                  <Flame className="mx-auto size-4 text-orange-500" />
                </th>
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => (
                <tr key={habit.id} className="border-b border-border last:border-0">
                  <td className="sticky left-0 z-10 bg-card px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex size-7 shrink-0 items-center justify-center rounded-md text-sm"
                        style={{
                          backgroundColor: `${habit.color ?? "var(--color-primary)"}15`,
                          color: habit.color ?? "var(--color-primary)",
                        }}
                      >
                        {habit.icon ?? habit.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{habit.name}</span>
                    </div>
                  </td>
                  {days.map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    return (
                      <td
                        key={dateStr}
                        className={cn(
                          "px-1 py-2 text-center",
                          isToday(day) && "bg-purple-50 dark:bg-purple-950/30",
                        )}
                      >
                        <div className="flex justify-center">
                          <HabitCell
                            habitId={habit.id}
                            date={dateStr}
                            isCompleted={habit.completions.includes(dateStr)}
                            isScheduled={isScheduledOn(
                              habit.frequencyType,
                              habit.scheduleDays,
                              day,
                            )}
                            isToday={isToday(day)}
                            color={habit.color}
                            onToggle={handleToggle}
                          />
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center">
                    {habit.streak > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        <Flame className="size-3" />
                        {habit.streak}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddHabitSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
