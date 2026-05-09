"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Plus, Trash2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useDeleteRecurring,
  useRecurring,
  useUpdateRecurring,
} from "../hooks";
import type { RecurringTransaction } from "../types";
import { AddRecurringSheet } from "./AddRecurringSheet";

function describeSchedule(r: RecurringTransaction): string {
  if (r.frequency === "DAILY") return "Every day";
  if (r.frequency === "WEEKLY")
    return `Every ${r.dayOfWeek?.toLowerCase() ?? "week"}`;
  return `Monthly on day ${r.dayOfMonth ?? "—"}`;
}

function ToggleButton({ r }: { r: RecurringTransaction }) {
  const update = useUpdateRecurring(r.id);
  return (
    <button
      type="button"
      onClick={() => update.mutate({ active: !r.active })}
      title={r.active ? "Pause" : "Resume"}
      className="text-muted-foreground hover:text-foreground"
    >
      {r.active ? <Pause className="size-4" /> : <Play className="size-4" />}
    </button>
  );
}

export function RecurringPage() {
  const { data = [], isLoading, isError } = useRecurring();
  const del = useDeleteRecurring();
  const [open, setOpen] = useState(false);

  function handleDelete(r: RecurringTransaction) {
    if (
      !window.confirm(
        `Delete recurring rule for "${r.categoryName ?? "category"}"?`,
      )
    )
      return;
    del.mutate(r.id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Recurring transactions
          </h1>
          <p className="text-muted-foreground">
            Automate fixed income & expenses (rent, salary, subscriptions).
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" data-icon="inline-start" />
          Add rule
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex justify-center py-12 text-sm text-destructive">
          Failed to load.
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No recurring rules yet.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setOpen(true)}
          >
            <Plus className="size-4" data-icon="inline-start" />
            Create your first rule
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {data.map((r) => (
            <li
              key={r.id}
              className={cn(
                "group flex items-center gap-3 px-4 py-3",
                !r.active && "opacity-60",
              )}
            >
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm"
                style={{
                  backgroundColor: `${r.categoryColor ?? "var(--color-primary)"}20`,
                  color: r.categoryColor ?? "var(--color-primary)",
                }}
              >
                {r.categoryIcon ?? r.categoryName?.charAt(0) ?? "•"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {r.note?.trim() || r.categoryName || "Recurring"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {describeSchedule(r)} · next{" "}
                  {format(parseISO(r.nextRunDate), "MMM d, yyyy")}
                </p>
              </div>
              <p
                className={cn(
                  "shrink-0 text-sm font-semibold tabular-nums",
                  r.type === "INCOME" ? "text-green-600" : "text-red-500",
                )}
              >
                {r.type === "INCOME" ? "+" : "-"}
                {r.amount.toFixed(2)} {r.currency}
              </p>
              <ToggleButton r={r} />
              <button
                onClick={() => handleDelete(r)}
                aria-label="Delete"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AddRecurringSheet open={open} onOpenChange={setOpen} />
    </div>
  );
}
