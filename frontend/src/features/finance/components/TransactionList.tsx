"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useCategories,
  useDeleteTransaction,
  useTransactions,
} from "../hooks";
import { categoryIcon } from "../icons";
import type { Transaction } from "../types";
import { AddTransactionSheet } from "./AddTransactionSheet";

const PAGE_SIZE = 20;

function formatAmount(amount: number) {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function TransactionList() {
  const [page, setPage] = useState(0);
  const [filterCategoryId, setFilterCategoryId] = useState<number | undefined>(
    undefined,
  );
  const [addOpen, setAddOpen] = useState(false);

  const { data: categories = [] } = useCategories();
  const {
    data: txPage,
    isLoading,
    isError,
    isFetching,
  } = useTransactions(page, PAGE_SIZE, filterCategoryId);
  const deleteTx = useDeleteTransaction();

  const transactions = txPage?.content ?? [];
  const totalPages = txPage?.totalPages ?? 0;
  const isFirst = txPage?.first ?? true;
  const isLast = txPage?.last ?? true;

  function handleDelete(tx: Transaction) {
    const ok = window.confirm(`Delete this transaction?`);
    if (!ok) return;
    deleteTx.mutate(tx.id);
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium">Transactions</h2>
        <div className="flex items-center gap-2">
          <select
            value={filterCategoryId ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setFilterCategoryId(v ? Number(v) : undefined);
              setPage(0);
            }}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" data-icon="inline-start" />
            Add
          </Button>
        </div>
      </div>

      {isLoading ? (
        <ul className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="size-9 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-4 w-16" />
            </li>
          ))}
        </ul>
      ) : isError ? (
        <div className="flex justify-center py-12 text-sm text-destructive">
          Failed to load transactions.
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-4" data-icon="inline-start" />
            Add your first transaction
          </Button>
        </div>
      ) : (
        <ul
          className={cn(
            "divide-y divide-border transition-opacity",
            isFetching && "opacity-60",
          )}
        >
          {transactions.map((tx) => {
            const Icon = categoryIcon(tx.categoryIcon);
            const isIncome = tx.type === "INCOME";
            return (
              <li
                key={tx.id}
                className="group flex items-center gap-3 px-4 py-3"
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `${tx.categoryColor ?? "var(--color-primary)"}20`,
                    color: tx.categoryColor ?? "var(--color-primary)",
                  }}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {tx.note?.trim() || tx.categoryName || "Transaction"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {tx.categoryName ?? "—"} ·{" "}
                    {format(new Date(tx.transactionDate), "MMM d, yyyy")}
                  </p>
                </div>
                <p
                  className={cn(
                    "shrink-0 text-sm font-semibold tabular-nums",
                    isIncome ? "text-green-600" : "text-red-500",
                  )}
                >
                  {isIncome ? "+" : "-"}
                  {formatAmount(tx.amount)}
                </p>
                <button
                  onClick={() => handleDelete(tx)}
                  aria-label="Delete transaction"
                  className="opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-border px-4 py-3">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={isFirst}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[5rem] text-center text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={isLast}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      <AddTransactionSheet open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
