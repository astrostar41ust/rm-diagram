"use client";

import { Check, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HabitGridItem } from "../types";

interface HabitRowProps {
  habit: HabitGridItem;
  today: string;
  onToggle: (habitId: number, date: string) => void;
}

export function HabitRow({ habit, today, onToggle }: HabitRowProps) {
  const isCompleted = habit.completions.includes(today);

  return (
    <button
      onClick={() => onToggle(habit.id, today)}
      className={cn(
        "flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors",
        isCompleted && "border-transparent ring-1",
      )}
      style={
        isCompleted
          ? {
              borderColor: habit.color ?? "var(--color-primary)",
              boxShadow: `0 0 0 1px ${habit.color ?? "var(--color-primary)"}20`,
            }
          : undefined
      }
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg text-lg transition-colors",
          isCompleted ? "text-white" : "bg-muted text-muted-foreground",
        )}
        style={
          isCompleted
            ? { backgroundColor: habit.color ?? "var(--color-primary)" }
            : undefined
        }
      >
        {habit.icon ? (
          <span>{habit.icon}</span>
        ) : isCompleted ? (
          <Check className="size-5" />
        ) : (
          <span className="text-sm font-medium">
            {habit.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex-1 text-left">
        <p className="font-medium">{habit.name}</p>
        <p className="text-xs text-muted-foreground">
          {habit.frequencyType === "DAILY"
            ? "Every day"
            : habit.frequencyType === "SPECIFIC_DAYS"
              ? habit.scheduleDays?.replace(/,/g, ", ")
              : "Custom"}
        </p>
      </div>

      {habit.streak > 0 && (
        <div className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
          <Flame className="size-3" />
          {habit.streak}
        </div>
      )}

      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          isCompleted
            ? "border-transparent text-white"
            : "border-muted-foreground/30",
        )}
        style={
          isCompleted
            ? { backgroundColor: habit.color ?? "var(--color-primary)" }
            : undefined
        }
      >
        {isCompleted && <Check className="size-4" />}
      </div>
    </button>
  );
}
