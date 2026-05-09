"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Calendar, CreditCard, Plus, TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSubscriptions } from "../hooks";

function format2(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function describe(frequency: string) {
  if (frequency === "MONTHLY") return "Monthly";
  if (frequency === "WEEKLY") return "Weekly";
  return "Daily";
}

export function SubscriptionsPage() {
  const { data, isLoading, isError } = useSubscriptions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            Recurring expenses, sorted by what they cost you each month.
          </p>
        </div>
        <Link
          href="/finance/recurring"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Add rule
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : isError || !data ? (
        <div className="flex justify-center py-12 text-sm text-destructive">
          Failed to load subscriptions.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CreditCard className="size-4 text-primary" />
                  Active subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">
                  {data.summary.count}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {data.summary.byFrequency.MONTHLY} monthly ·{" "}
                  {data.summary.byFrequency.WEEKLY} weekly ·{" "}
                  {data.summary.byFrequency.DAILY} daily
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingDown className="size-4 text-red-500" />
                  Estimated monthly
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">
                  {format2(data.summary.totalMonthly)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {data.summary.baseCurrency}
                  </span>
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Sums rules priced in {data.summary.baseCurrency}; weekly ×4.33,
                  daily ×30.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-amber-500" />
                  Renewing this week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">
                  {data.summary.upcomingThisWeek.length}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Next 7 days
                </p>
              </CardContent>
            </Card>
          </div>

          {data.subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
              <p className="text-sm text-muted-foreground">
                No active subscriptions.
              </p>
              <Link
                href="/finance/recurring"
                className="mt-4 inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-input bg-transparent px-3 text-xs font-medium transition-colors hover:bg-accent"
              >
                <Plus className="size-4" />
                Add a recurring rule
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {data.subscriptions.map((s) => {
                const upcoming = data.summary.upcomingThisWeek.some(
                  (u) => u.id === s.id,
                );
                return (
                  <li
                    key={s.id}
                    className="group flex items-center gap-3 px-4 py-3"
                  >
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm"
                      style={{
                        backgroundColor: `${s.categoryColor ?? "var(--color-primary)"}20`,
                        color: s.categoryColor ?? "var(--color-primary)",
                      }}
                    >
                      {s.categoryIcon ?? s.categoryName?.charAt(0) ?? "•"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {s.note?.trim() || s.categoryName || "Subscription"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {describe(s.frequency)} · next{" "}
                        {format(parseISO(s.nextRunDate), "MMM d")}
                      </p>
                    </div>
                    {upcoming && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        renews soon
                      </span>
                    )}
                    <p
                      className={cn(
                        "shrink-0 text-sm font-semibold tabular-nums text-red-500",
                      )}
                    >
                      -{s.amount.toFixed(2)} {s.currency}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
