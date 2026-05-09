"use client";

import { format } from "date-fns";
import Link from "next/link";
import { Flame, Repeat, Target, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/features/auth/hooks";
import { useDashboard } from "../hooks";
import { useHabitGrid, useToggleCompletion } from "@/features/habit/hooks";
import { useTransactions } from "@/features/finance/hooks";
import { useGoals } from "@/features/goal/hooks";
import { categoryIcon } from "@/features/finance/icons";

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatCurrency(amount: number) {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function DashboardPage() {
  const user = useCurrentUser();
  const { data: dashboard, isLoading: dashLoading } = useDashboard();

  const today = format(new Date(), "yyyy-MM-dd");
  const { data: grid, isLoading: gridLoading } = useHabitGrid(today, today);
  const toggleHabit = useToggleCompletion(today, today);

  const { data: txPage, isLoading: txLoading } = useTransactions(0, 5);
  const { data: activeGoals = [], isLoading: goalsLoading } =
    useGoals("ACTIVE");

  const habitName = user?.firstname || user?.username || "there";
  const habitTotal = dashboard?.habitSummary.totalHabits ?? 0;
  const habitDone = dashboard?.habitSummary.completedToday ?? 0;
  const habitPercent =
    habitTotal === 0 ? 0 : Math.round((habitDone / habitTotal) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting(new Date().getHours())}, {habitName}
        </h1>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Repeat className="size-4" />}
          label="Habits today"
          loading={dashLoading}
          value={`${habitDone}/${habitTotal}`}
          hint={`${habitPercent}% complete`}
        />
        <StatCard
          icon={<Flame className="size-4 text-orange-500" />}
          label="Best streak"
          loading={dashLoading}
          value={`${dashboard?.habitSummary.bestStreak ?? 0}d`}
          hint={dashboard?.habitSummary.bestStreakHabitName ?? "No streaks yet"}
        />
        <StatCard
          icon={<Wallet className="size-4" />}
          label="This month"
          loading={dashLoading}
          value={formatCurrency(dashboard?.financeSummary.monthlyNet ?? 0)}
          valueClassName={cn(
            (dashboard?.financeSummary.monthlyNet ?? 0) < 0 && "text-red-500",
            (dashboard?.financeSummary.monthlyNet ?? 0) > 0 && "text-green-600",
          )}
          hint={`+${formatCurrency(dashboard?.financeSummary.monthlyIncome ?? 0)} / -${formatCurrency(dashboard?.financeSummary.monthlyExpense ?? 0)}`}
        />
        <StatCard
          icon={<Target className="size-4" />}
          label="Goals"
          loading={dashLoading}
          value={`${dashboard?.goalSummary.totalActive ?? 0} active`}
          hint={`${dashboard?.goalSummary.totalCompleted ?? 0} completed`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s habits</CardTitle>
            <CardDescription>Tick them off as you go.</CardDescription>
          </CardHeader>
          <CardContent>
            {gridLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : (grid?.habits ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No habits yet.{" "}
                <Link href="/habits" className="text-primary hover:underline">
                  Create one
                </Link>
              </p>
            ) : (
              <ul className="space-y-1">
                {grid!.habits.map((h) => {
                  const done = h.completions.includes(today);
                  return (
                    <li key={h.id}>
                      <button
                        onClick={() =>
                          toggleHabit.mutate({ habitId: h.id, date: today })
                        }
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/50",
                          done && "opacity-60",
                        )}
                      >
                        <div
                          className="flex size-7 shrink-0 items-center justify-center rounded-md text-sm"
                          style={{
                            backgroundColor: `${h.color ?? "var(--color-primary)"}20`,
                            color: h.color ?? "var(--color-primary)",
                          }}
                        >
                          {h.icon ?? h.name.charAt(0).toUpperCase()}
                        </div>
                        <span
                          className={cn(
                            "flex-1 text-sm font-medium",
                            done && "line-through",
                          )}
                        >
                          {h.name}
                        </span>
                        <span
                          className={cn(
                            "size-5 shrink-0 rounded-full border-2 transition-colors",
                            done
                              ? "border-transparent bg-green-500"
                              : "border-muted-foreground/30",
                          )}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
            <CardDescription>Your last 5 transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            {txLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : (txPage?.content ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No transactions yet.{" "}
                <Link href="/finance" className="text-primary hover:underline">
                  Add one
                </Link>
              </p>
            ) : (
              <ul className="space-y-1">
                {txPage!.content.map((tx) => {
                  const Icon = categoryIcon(tx.categoryIcon);
                  const isIncome = tx.type === "INCOME";
                  return (
                    <li
                      key={tx.id}
                      className="flex items-center gap-3 rounded-lg px-2 py-2"
                    >
                      <div
                        className="flex size-7 shrink-0 items-center justify-center rounded-md"
                        style={{
                          backgroundColor: `${tx.categoryColor ?? "var(--color-primary)"}20`,
                          color: tx.categoryColor ?? "var(--color-primary)",
                        }}
                      >
                        <Icon className="size-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {tx.note?.trim() || tx.categoryName || "Transaction"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {format(new Date(tx.transactionDate), "MMM d")}
                        </p>
                      </div>
                      <p
                        className={cn(
                          "shrink-0 text-sm font-semibold tabular-nums",
                          isIncome ? "text-green-600" : "text-red-500",
                        )}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active goals</CardTitle>
          <CardDescription>
            {goalsLoading
              ? "Loading…"
              : `${activeGoals.length} in progress`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {goalsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : activeGoals.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No active goals.{" "}
              <Link href="/goals" className="text-primary hover:underline">
                Set one
              </Link>
            </p>
          ) : (
            <ul className="space-y-3">
              {activeGoals.slice(0, 5).map((g) => (
                <li key={g.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Link
                      href="/goals"
                      className="truncate text-sm font-medium hover:underline"
                    >
                      {g.title}
                    </Link>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {g.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  loading?: boolean;
  valueClassName?: string;
}

function StatCard({
  icon,
  label,
  value,
  hint,
  loading,
  valueClassName,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="space-y-1.5 pt-5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          {icon}
          {label}
        </div>
        {loading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <p className={cn("text-2xl font-semibold tabular-nums", valueClassName)}>
            {value}
          </p>
        )}
        {loading ? (
          <Skeleton className="h-3 w-24" />
        ) : hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
