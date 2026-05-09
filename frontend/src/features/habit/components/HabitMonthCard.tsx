"use client";

import { useMemo } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HabitGridItem } from "../types";

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

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

interface HabitMonthCardProps {
  habit: HabitGridItem;
  anchor: Date;
  onToggle: (habitId: number, date: string) => void;
  onOpenAnalytics: (habit: { id: number; color: string | null }) => void;
}

export function HabitMonthCard({
  habit,
  anchor,
  onToggle,
  onOpenAnalytics,
}: HabitMonthCardProps) {
  const accent = habit.color ?? "var(--color-primary)";

  const { weeks, completed, scheduled, percent } = useMemo(() => {
    const monthStart = startOfMonth(anchor);
    const monthEnd = endOfMonth(anchor);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

    let scheduledCount = 0;
    let completedCount = 0;
    for (const day of allDays) {
      if (!isSameMonth(day, anchor)) continue;
      const inSchedule = isScheduledOn(
        habit.frequencyType,
        habit.scheduleDays,
        day,
      );
      if (!inSchedule) continue;
      scheduledCount += 1;
      if (habit.completions.includes(format(day, "yyyy-MM-dd"))) {
        completedCount += 1;
      }
    }

    const rows: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      rows.push(allDays.slice(i, i + 7));
    }

    return {
      weeks: rows,
      scheduled: scheduledCount,
      completed: completedCount,
      percent:
        scheduledCount === 0
          ? 0
          : Math.round((completedCount / scheduledCount) * 100),
    };
  }, [habit, anchor]);

  const frequencyLabel =
    habit.frequencyType === "DAILY"
      ? "Every day"
      : habit.frequencyType === "SPECIFIC_DAYS"
        ? habit.scheduleDays?.replace(/,/g, ", ") ?? "Custom"
        : "Custom";

  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80">
      <div className="mb-4 flex items-start gap-3">
        <button
          type="button"
          onClick={() =>
            onOpenAnalytics({ id: habit.id, color: habit.color })
          }
          className="flex min-w-0 flex-1 items-center gap-3 text-left transition-opacity hover:opacity-80"
        >
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-base"
            style={{ backgroundColor: `${accent}1f`, color: accent }}
          >
            {habit.icon ?? habit.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{habit.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {frequencyLabel}
            </p>
          </div>
        </button>

        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <div className="flex items-center gap-1.5">
            {habit.streak > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                <Flame className="size-3" />
                {habit.streak}
              </span>
            )}
            <span className="text-sm font-medium tabular-nums">
              {completed}/{scheduled}
            </span>
          </div>
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {percent}% complete
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="grid grid-cols-7 gap-1">
          {DAY_LABELS.map((d, i) => (
            <span
              key={i}
              className="text-center text-[10px] font-medium uppercase text-muted-foreground"
            >
              {d}
            </span>
          ))}
        </div>

        <div className="space-y-1">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="grid grid-cols-7 gap-1">
              {week.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const inMonth = isSameMonth(day, anchor);
                const scheduledHere = isScheduledOn(
                  habit.frequencyType,
                  habit.scheduleDays,
                  day,
                );
                const completedHere = habit.completions.includes(dateStr);
                const today = isToday(day);
                const interactive = inMonth && scheduledHere;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() =>
                      interactive && onToggle(habit.id, dateStr)
                    }
                    disabled={!interactive}
                    className={cn(
                      "relative flex aspect-square items-center justify-center rounded-md border text-[11px] font-medium tabular-nums transition-colors",
                      !inMonth && "border-transparent text-muted-foreground/40",
                      inMonth &&
                        !scheduledHere &&
                        "border-dashed border-border/40 text-muted-foreground/50",
                      inMonth &&
                        scheduledHere &&
                        !completedHere &&
                        "border-border text-foreground hover:border-foreground/50 hover:bg-muted/40",
                      completedHere && "border-transparent text-white",
                      today &&
                        !completedHere &&
                        "ring-2 ring-primary/30 ring-offset-1 ring-offset-card",
                    )}
                    style={
                      completedHere
                        ? { backgroundColor: accent }
                        : undefined
                    }
                    aria-label={`${habit.name} ${format(day, "MMM d, yyyy")}`}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
