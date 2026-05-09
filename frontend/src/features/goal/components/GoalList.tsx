"use client";

import { useState } from "react";
import { Plus, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGoals } from "../hooks";
import type { GoalStatus } from "../types";
import { GoalCard } from "./GoalCard";
import { AddGoalSheet } from "./AddGoalSheet";

type FilterTab = "ALL" | GoalStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "ACTIVE", label: "Active" },
  { key: "COMPLETED", label: "Completed" },
];

export function GoalList() {
  const [tab, setTab] = useState<FilterTab>("ACTIVE");
  const [addOpen, setAddOpen] = useState(false);

  const status = tab === "ALL" ? undefined : tab;
  const { data: goals = [], isLoading, isError, isFetching } = useGoals(status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">
            Track what you&apos;re working towards.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="size-4" data-icon="inline-start" />
          Add goal
        </Button>
      </div>

      <div
        role="tablist"
        aria-label="Filter goals by status"
        className="inline-flex gap-1 rounded-lg border border-border p-1"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              tab === t.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-border bg-card p-5"
            >
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-1.5 w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex justify-center py-12 text-sm text-destructive">
          Failed to load goals.
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Target className="size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            {tab === "COMPLETED"
              ? "No completed goals yet."
              : tab === "ACTIVE"
                ? "No active goals."
                : "No goals yet."}
          </p>
          {tab !== "COMPLETED" && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="size-4" data-icon="inline-start" />
              Create your first goal
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4 transition-opacity sm:grid-cols-2",
            isFetching && "opacity-60",
          )}
        >
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      <AddGoalSheet open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
