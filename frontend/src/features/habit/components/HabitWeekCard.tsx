"use client";

import { Check, Flame } from "lucide-react";
import { format, isToday } from "date-fns";
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

interface HabitWeekCardProps {
  habit: HabitGridItem;
  days: Date[];
  onToggle: (habitId: number, date: string) => void;
  onOpenAnalytics: (habit: { id: number; color: string | null }) => void;
}

export function HabitWeekCard({
  habit,
  days,
  onToggle,
  onOpenAnalytics,
}: HabitWeekCardProps) {
  const accent = habit.color ?? "var(--color-primary)";

  const scheduledDays = days.filter((d) =>
    isScheduledOn(habit.frequencyType, habit.scheduleDays, d),
  );
  const completedDays = scheduledDays.filter((d) =>
    habit.completions.includes(format(d, "yyyy-MM-dd")),
  );

  const frequencyLabel =
    habit.frequencyType === "DAILY"
      ? "Every day"
      : habit.frequencyType === "SPECIFIC_DAYS"
        ? habit.scheduleDays?.replace(/,/g, ", ") ?? "Custom"
        : "Custom";

  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            onOpenAnalytics({ id: habit.id, color: habit.color })
          }
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left transition-opacity hover:opacity-80"
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

        <div className="flex shrink-0 items-center gap-2">
          {habit.streak > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              <Flame className="size-3" />
              {habit.streak}
            </span>
          )}
          <span className="text-sm font-medium tabular-nums text-muted-foreground">
            {completedDays.length}/{scheduledDays.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const scheduled = isScheduledOn(
            habit.frequencyType,
            habit.scheduleDays,
            day,
          );
          const completed = habit.completions.includes(dateStr);
          const today = isToday(day);

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => scheduled && onToggle(habit.id, dateStr)}
              disabled={!scheduled}
              className={cn(
                "group flex flex-col items-center gap-1.5 rounded-lg py-2 transition-colors",
                scheduled
                  ? "hover:bg-muted/60"
                  : "cursor-not-allowed opacity-40",
              )}
              aria-label={`${habit.name} ${format(day, "EEEE, MMM d")}`}
            >
              <span
                className={cn(
                  "text-[10px] font-medium uppercase tracking-wide",
                  today ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {format(day, "EEEEE")}
              </span>
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border-2 text-xs font-medium tabular-nums transition-colors",
                  today && !completed && "ring-2 ring-primary/30 ring-offset-2 ring-offset-card",
                  completed
                    ? "border-transparent text-white"
                    : scheduled
                      ? "border-border text-foreground group-hover:border-foreground/50"
                      : "border-dashed border-border/50 text-muted-foreground",
                )}
                style={completed ? { backgroundColor: accent } : undefined}
              >
                {completed ? (
                  <Check className="size-4" />
                ) : (
                  format(day, "d")
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
