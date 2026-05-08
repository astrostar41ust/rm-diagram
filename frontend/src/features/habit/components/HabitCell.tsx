"use client";

import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitCellProps {
  habitId: number;
  date: string;
  isCompleted: boolean;
  isScheduled: boolean;
  isToday: boolean;
  color: string | null;
  onToggle: (habitId: number, date: string) => void;
}

export function HabitCell({
  habitId,
  date,
  isCompleted,
  isScheduled,
  isToday,
  color,
  onToggle,
}: HabitCellProps) {
  if (!isScheduled) {
    return (
      <div className="flex size-8 items-center justify-center">
        <Minus className="size-3 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <button
      onClick={() => onToggle(habitId, date)}
      className={cn(
        "flex size-8 items-center justify-center rounded-md border transition-colors",
        isToday && "ring-2 ring-purple-400/50",
        isCompleted
          ? "border-transparent"
          : "border-border hover:border-foreground/30",
      )}
      style={
        isCompleted
          ? { backgroundColor: color ?? "var(--color-primary)" }
          : undefined
      }
    >
      {isCompleted && <Check className="size-4 text-white" />}
    </button>
  );
}
