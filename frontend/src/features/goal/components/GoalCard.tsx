"use client";

import { useState } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Circle,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAddMilestone,
  useDeleteGoal,
  useDeleteMilestone,
  useToggleMilestone,
} from "../hooks";
import type { Goal } from "../types";

interface GoalCardProps {
  goal: Goal;
}

function dueLabel(targetDate: string | null, isCompleted: boolean) {
  if (!targetDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  const diff = differenceInCalendarDays(target, today);

  if (isCompleted) {
    return { text: "Completed", tone: "success" as const };
  }
  if (diff < 0) {
    return { text: `Overdue by ${Math.abs(diff)}d`, tone: "danger" as const };
  }
  if (diff === 0) {
    return { text: "Due today", tone: "warning" as const };
  }
  if (diff <= 7) {
    return { text: `${diff}d left`, tone: "warning" as const };
  }
  return { text: `${diff}d left`, tone: "muted" as const };
}

const TONE_STYLES = {
  success:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  muted: "bg-muted text-muted-foreground",
};

export function GoalCard({ goal }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [newMilestone, setNewMilestone] = useState("");

  const toggleMilestone = useToggleMilestone(goal.id);
  const addMilestone = useAddMilestone(goal.id);
  const deleteMilestone = useDeleteMilestone(goal.id);
  const deleteGoal = useDeleteGoal();

  const isCompleted = goal.status === "COMPLETED";
  const due = dueLabel(goal.targetDate, isCompleted);
  const progressColor = isCompleted ? "bg-green-500" : "bg-primary";

  function handleAddMilestone(e: React.FormEvent) {
    e.preventDefault();
    const title = newMilestone.trim();
    if (!title) return;
    addMilestone.mutate(
      { title },
      {
        onSuccess: () => setNewMilestone(""),
      },
    );
  }

  function handleDeleteGoal() {
    const ok = window.confirm(`Delete goal "${goal.title}"?`);
    if (!ok) return;
    deleteGoal.mutate(goal.id);
  }

  return (
    <div className="rounded-xl border border-border bg-card transition-colors">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start gap-3 p-5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className={cn("font-medium", isCompleted && "line-through text-muted-foreground")}>
              {goal.title}
            </p>
            {due && (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  TONE_STYLES[due.tone],
                )}
              >
                <Calendar className="size-3" />
                {due.text}
              </span>
            )}
          </div>

          {goal.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {goal.description}
            </p>
          )}

          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {goal.linkType !== "NONE" && goal.progressLabel
                  ? goal.progressLabel
                  : `${goal.milestones.filter((m) => m.completed).length} / ${goal.milestones.length} milestones`}
              </span>
              <span className="font-medium tabular-nums">{goal.progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full transition-all", progressColor)}
                style={{ width: `${goal.progress}%` }}
              />
            </div>
            {goal.linkType !== "NONE" && (
              <p className="text-[10px] text-muted-foreground">
                Auto-tracked from{" "}
                {goal.linkType === "HABIT" ? "habit" : "transactions"}
              </p>
            )}
          </div>
        </div>

        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-border px-5 py-4">
          {goal.targetDate && (
            <p className="text-xs text-muted-foreground">
              Target: {format(new Date(goal.targetDate), "MMMM d, yyyy")}
            </p>
          )}

          {goal.milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground">No milestones yet.</p>
          ) : (
            <ul className="space-y-1">
              {goal.milestones.map((m) => (
                <li
                  key={m.id}
                  className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50"
                >
                  <button
                    onClick={() => toggleMilestone.mutate(m.id)}
                    aria-label={
                      m.completed ? "Mark incomplete" : "Mark complete"
                    }
                    className="shrink-0"
                  >
                    {m.completed ? (
                      <CheckCircle2 className="size-5 text-green-500" />
                    ) : (
                      <Circle className="size-5 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      m.completed && "line-through text-muted-foreground",
                    )}
                  >
                    {m.title}
                  </span>
                  <button
                    onClick={() => deleteMilestone.mutate(m.id)}
                    aria-label="Delete milestone"
                    className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAddMilestone} className="flex gap-2">
            <Input
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              placeholder="Add a milestone…"
              className="h-8"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newMilestone.trim() || addMilestone.isPending}
            >
              <Plus className="size-4" />
            </Button>
          </form>

          <div className="flex justify-end pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteGoal}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4" data-icon="inline-start" />
              Delete goal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
