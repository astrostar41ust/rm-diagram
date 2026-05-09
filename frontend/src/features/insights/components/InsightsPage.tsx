"use client";

import {
  CheckCircle2,
  PieChart,
  Smile,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { moodConfig } from "@/features/note/mood";
import type { Mood } from "@/features/note/types";
import { useInsights } from "../hooks";

function format2(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export function InsightsPage() {
  const { data, isLoading, isError } = useInsights();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
        <p className="text-muted-foreground">
          Patterns across habits, money, and mood — at a glance.
        </p>
      </div>

      {isLoading || !data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-center text-sm text-destructive">Failed to load.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="size-4 text-green-500" />
                  This month — Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">
                  {format2(data.monthIncome)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {data.baseCurrency}
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingDown className="size-4 text-red-500" />
                  This month — Expense
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">
                  {format2(data.monthExpense)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {data.baseCurrency}
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Wallet className="size-4 text-primary" />
                  Net
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={cn(
                    "text-2xl font-semibold tabular-nums",
                    data.monthNet < 0 && "text-red-500",
                  )}
                >
                  {format2(data.monthNet)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {data.baseCurrency}
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <PieChart className="size-4 text-primary" />
                  Top spending categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.topExpenseCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No expenses this month yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {data.topExpenseCategories.map((c) => {
                      const max = data.topExpenseCategories[0].total || 1;
                      const w = Math.max(2, (c.total / max) * 100);
                      return (
                        <li key={c.name} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <span
                                className="flex size-5 items-center justify-center rounded text-xs"
                                style={{
                                  backgroundColor: `${c.color ?? "var(--color-primary)"}20`,
                                  color: c.color ?? "var(--color-primary)",
                                }}
                              >
                                {c.icon ?? c.name.charAt(0)}
                              </span>
                              {c.name}
                            </span>
                            <span className="tabular-nums">
                              {format2(c.total)} {data.baseCurrency}
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${w}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="size-4 text-primary" />
                  Habit completion (30 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.habitCompletionRates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No habits yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {data.habitCompletionRates.map((h) => (
                      <li key={h.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="truncate">{h.name}</span>
                          <span className="tabular-nums text-muted-foreground">
                            {h.completed}/{h.scheduled} · {pct(h.rate)}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${Math.round(h.rate * 100)}%`,
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Smile className="size-4 text-amber-500" />
                  Mood trend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(data.moodCounts).map(([m, n]) => {
                    const cfg = moodConfig(m as Mood);
                    return (
                      <span
                        key={m}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                          cfg.className,
                        )}
                      >
                        <span>{cfg.emoji}</span>
                        {cfg.label} · {n}
                      </span>
                    );
                  })}
                  {Object.keys(data.moodCounts).length === 0 && (
                    <span className="text-sm text-muted-foreground">
                      No mood data yet.
                    </span>
                  )}
                </div>
                {data.moodHistory.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {data.moodHistory.slice(0, 30).map((m) => {
                      const cfg = moodConfig(m.mood);
                      return (
                        <span
                          key={m.date}
                          className="text-base"
                          title={`${m.date}: ${cfg.label}`}
                        >
                          {cfg.emoji}
                        </span>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="size-4 text-primary" />
                  Goal velocity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.goalVelocities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No goals.</p>
                ) : (
                  <ul className="space-y-2">
                    {data.goalVelocities.map((g) => (
                      <li
                        key={g.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate">{g.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {g.daysActive}d active · {g.progress}%
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Velocity uses the goal&apos;s computed progress; auto-tracked
                  goals will show recent movement once linked.
                </p>
              </CardContent>
            </Card>
          </div>

          <p className="mt-2 text-[10px] text-muted-foreground">
            Currency conversions use the static rates baked into the backend.
          </p>
        </>
      )}
    </div>
  );
}
