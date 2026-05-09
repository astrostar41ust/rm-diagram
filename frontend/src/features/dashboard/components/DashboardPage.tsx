"use client";

import { useState } from "react";
import Link from "next/link";
import { addDays, format, parseISO, subDays } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Flame,
  Repeat,
  StickyNote,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useCurrentUser } from "@/features/auth/hooks";
import { useDashboard } from "../hooks";
import { useToggleCompletion } from "@/features/habit/hooks";
import { HabitHeatmap } from "@/features/habit/components/HabitHeatmap";
import { useTransactions } from "@/features/finance/hooks";
import { useGoals } from "@/features/goal/hooks";
import { categoryIcon } from "@/features/finance/icons";
import { useDay } from "@/features/day/hooks";

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function format2(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function DashboardPage() {
  const user = useCurrentUser();
  const greetingName = user?.firstname || user?.username || "there";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting(new Date().getHours())}, {greetingName}
        </h1>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="month">This month</TabsTrigger>
          <TabsTrigger value="year">This year</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <TodayTab />
        </TabsContent>
        <TabsContent value="month">
          <MonthTab />
        </TabsContent>
        <TabsContent value="year">
          <YearTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ──────────────────────── Today tab ──────────────────────── */

function TodayTab() {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const { data, isLoading } = useDay(date);
  const toggle = useToggleCompletion(date, date);
  const isToday = date === format(new Date(), "yyyy-MM-dd");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium">
          {isToday ? "Today" : format(parseISO(date), "EEEE, MMMM d")}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() =>
              setDate(format(subDays(parseISO(date), 1), "yyyy-MM-dd"))
            }
          >
            <ChevronLeft className="size-4" />
          </Button>
          {!isToday && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDate(format(new Date(), "yyyy-MM-dd"))}
            >
              Today
            </Button>
          )}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() =>
              setDate(format(addDays(parseISO(date), 1), "yyyy-MM-dd"))
            }
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {isLoading || !data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="size-4 text-primary" />
                Habits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {data.habits.length === 0 && (
                <p className="text-sm text-muted-foreground">No habits yet.</p>
              )}
              {data.habits.map((h) => {
                const dim = !h.scheduled;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => toggle.mutate({ habitId: h.id, date })}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/50",
                      dim && "opacity-50",
                    )}
                  >
                    {h.completed ? (
                      <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                    ) : (
                      <Circle className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span
                      className="flex size-6 items-center justify-center rounded text-xs"
                      style={{
                        backgroundColor: `${h.color ?? "var(--color-primary)"}20`,
                        color: h.color ?? "var(--color-primary)",
                      }}
                    >
                      {h.icon ?? h.name.charAt(0).toUpperCase()}
                    </span>
                    <span
                      className={cn(
                        "flex-1 truncate",
                        h.completed && "line-through text-muted-foreground",
                      )}
                    >
                      {h.name}
                    </span>
                    {!h.scheduled && (
                      <span className="text-[10px] text-muted-foreground">
                        not today
                      </span>
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="size-4 text-green-500" />
                Money
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">
                    In
                  </p>
                  <p className="text-base font-semibold text-green-600">
                    +{format2(data.totalIncome)} {data.baseCurrency}
                  </p>
                </div>
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">
                    Out
                  </p>
                  <p className="text-base font-semibold text-red-500">
                    -{format2(data.totalExpense)} {data.baseCurrency}
                  </p>
                </div>
              </div>
              {data.transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No transactions today.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {data.transactions.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center gap-2 py-1.5 text-sm"
                    >
                      <span
                        className="flex size-6 shrink-0 items-center justify-center rounded text-xs"
                        style={{
                          backgroundColor: `${t.categoryColor ?? "var(--color-primary)"}20`,
                          color: t.categoryColor ?? "var(--color-primary)",
                        }}
                      >
                        {t.categoryIcon ?? "•"}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {t.note?.trim() || t.categoryName || "Transaction"}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 tabular-nums",
                          t.type === "INCOME"
                            ? "text-green-600"
                            : "text-red-500",
                        )}
                      >
                        {t.type === "INCOME" ? "+" : "-"}
                        {format2(t.amount)} {t.currency}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <StickyNote className="size-4 text-amber-500" />
                Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing journaled for this day.{" "}
                  <Link href="/notes" className="text-primary hover:underline">
                    Write one
                  </Link>
                </p>
              ) : (
                <div className="space-y-3">
                  {data.notes.map((n) => (
                    <div key={n.id}>
                      <p className="font-medium">{n.title}</p>
                      <p className="line-clamp-4 text-sm text-muted-foreground whitespace-pre-line">
                        {n.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="size-4 text-primary" />
                Active goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.activeGoals.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active goals.
                </p>
              ) : (
                data.activeGoals.map((g) => (
                  <div key={g.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{g.title}</span>
                      {g.targetDate && (
                        <span className="text-[10px] text-muted-foreground">
                          due {format(parseISO(g.targetDate), "MMM d")}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reserved for future trend strip */}
      <div className="hidden">
        <TrendingDown />
        <Calendar />
      </div>
    </div>
  );
}

/* ──────────────────────── Month tab ──────────────────────── */

function MonthTab() {
  const { data: dashboard, isLoading: dashLoading } = useDashboard();
  const { data: txPage, isLoading: txLoading } = useTransactions(0, 5);
  const { data: activeGoals = [], isLoading: goalsLoading } =
    useGoals("ACTIVE");

  const habitTotal = dashboard?.habitSummary.totalHabits ?? 0;
  const habitDone = dashboard?.habitSummary.completedToday ?? 0;
  const habitPercent =
    habitTotal === 0 ? 0 : Math.round((habitDone / habitTotal) * 100);

  return (
    <div className="space-y-4">
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
          value={format2(dashboard?.financeSummary.monthlyNet ?? 0)}
          valueClassName={cn(
            (dashboard?.financeSummary.monthlyNet ?? 0) < 0 && "text-red-500",
            (dashboard?.financeSummary.monthlyNet ?? 0) > 0 && "text-green-600",
          )}
          hint={`+${format2(dashboard?.financeSummary.monthlyIncome ?? 0)} / -${format2(dashboard?.financeSummary.monthlyExpense ?? 0)}`}
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
                        {format2(tx.amount)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active goals</CardTitle>
            <CardDescription>
              {goalsLoading ? "Loading…" : `${activeGoals.length} in progress`}
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
    </div>
  );
}

/* ──────────────────────── Year tab ──────────────────────── */

function YearTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Habit activity</CardTitle>
        <CardDescription>The last 12 months at a glance.</CardDescription>
      </CardHeader>
      <CardContent>
        <HabitHeatmap />
      </CardContent>
    </Card>
  );
}

/* ──────────────────────── Stat card ──────────────────────── */

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
