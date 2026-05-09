"use client";

import { useState } from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useBudgets, useDeleteBudget } from "../hooks";
import type { Budget, BudgetStatus } from "../types";
import { AddBudgetSheet } from "./AddBudgetSheet";

function statusClass(status: BudgetStatus) {
  if (status === "OVER") return "bg-red-500";
  if (status === "WARNING") return "bg-amber-500";
  return "bg-primary";
}

function statusLabel(status: BudgetStatus) {
  if (status === "OVER") return "Over budget";
  if (status === "WARNING") return "Approaching limit";
  return "On track";
}

function formatAmount(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function BudgetCard({
  budget,
  onDelete,
}: {
  budget: Budget;
  onDelete: () => void;
}) {
  const pct = Math.min(budget.percentUsed, 100);
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="truncate font-medium">
            {budget.categoryName ?? "Category"}
          </p>
          <p className="text-xs text-muted-foreground">
            {statusLabel(budget.status)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {budget.status !== "OK" && (
            <AlertTriangle
              className={cn(
                "size-4",
                budget.status === "OVER" ? "text-red-500" : "text-amber-500",
              )}
            />
          )}
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete budget"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-2 rounded-full transition-all",
            statusClass(budget.status),
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>
          {formatAmount(budget.currentSpending)} /{" "}
          {formatAmount(budget.monthlyLimit)} {budget.baseCurrency}
        </span>
        <span>{budget.percentUsed}%</span>
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">
        Alert at {budget.alertThreshold}%
      </p>
    </div>
  );
}

export function BudgetsPage() {
  const { data: budgets = [], isLoading, isError } = useBudgets();
  const del = useDeleteBudget();
  const [addOpen, setAddOpen] = useState(false);

  function handleDelete(b: Budget) {
    if (!window.confirm(`Delete budget for "${b.categoryName ?? "category"}"?`))
      return;
    del.mutate(b.id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Set spending limits by category and get warned before you blow them.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="size-4" data-icon="inline-start" />
          Add budget
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex justify-center py-12 text-sm text-destructive">
          Failed to load budgets.
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No budgets yet.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-4" data-icon="inline-start" />
            Create your first budget
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onDelete={() => handleDelete(b)}
            />
          ))}
        </div>
      )}

      <AddBudgetSheet open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
