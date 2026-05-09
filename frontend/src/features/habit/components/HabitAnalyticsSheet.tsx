"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useHabitAnalytics } from "../hooks";
import type { DailyPoint, WeeklyPoint } from "../types";

interface HabitAnalyticsSheetProps {
  habitId: number | null;
  habitColor?: string | null;
  onOpenChange: (open: boolean) => void;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function Heatmap({
  daily,
  color,
}: {
  daily: DailyPoint[];
  color?: string | null;
}) {
  const accent = color ?? "var(--color-primary)";
  const columns = useMemo(() => {
    if (daily.length === 0) return [] as DailyPoint[][];
    const first = parseISO(daily[0].date);
    const offset = (first.getDay() + 6) % 7;
    const padded: (DailyPoint | null)[] = [
      ...Array(offset).fill(null),
      ...daily,
    ];
    while (padded.length % 7 !== 0) padded.push(null);
    const cols: (DailyPoint | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      cols.push(padded.slice(i, i + 7));
    }
    return cols;
  }, [daily]);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((d, di) => {
              if (!d)
                return <div key={di} className="size-3 rounded-[3px]" />;
              const opacity = d.completed ? 1 : d.scheduled ? 0.18 : 0.06;
              const bg = d.completed ? accent : "var(--color-muted-foreground)";
              return (
                <div
                  key={d.date}
                  title={`${d.date}${d.completed ? " · done" : d.scheduled ? " · missed" : " · off"}`}
                  className="size-3 rounded-[3px]"
                  style={{ backgroundColor: bg, opacity }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function WeeklyBars({
  weekly,
  color,
}: {
  weekly: WeeklyPoint[];
  color?: string | null;
}) {
  const accent = color ?? "var(--color-primary)";
  const recent = weekly.slice(-12);
  if (recent.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No weekly data yet.</p>
    );
  }
  return (
    <div className="flex items-end gap-1.5">
      {recent.map((w) => {
        const pct =
          w.scheduled === 0 ? 0 : Math.round((w.completed / w.scheduled) * 100);
        const height = Math.max(4, pct);
        return (
          <div
            key={w.weekStart}
            className="flex flex-1 flex-col items-center gap-1"
            title={`${w.weekStart}: ${w.completed}/${w.scheduled} (${pct}%)`}
          >
            <div className="flex h-24 w-full items-end">
              <div
                className="w-full rounded-t-sm transition-all"
                style={{ height: `${height}%`, backgroundColor: accent }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground">
              {format(parseISO(w.weekStart), "M/d")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function HabitAnalyticsSheet({
  habitId,
  habitColor,
  onOpenChange,
}: HabitAnalyticsSheetProps) {
  const open = habitId != null;
  const { data, isLoading } = useHabitAnalytics(habitId, 180);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col sm:!max-w-xl">
        <SheetHeader>
          <SheetTitle>{data?.name ?? "Habit analytics"}</SheetTitle>
          <SheetDescription>
            Last {data?.windowDays ?? 180} days of activity.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
          {isLoading || !data ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Current streak"
                  value={`${data.currentStreak} day${data.currentStreak === 1 ? "" : "s"}`}
                />
                <StatCard
                  label="Longest streak"
                  value={`${data.longestStreak} day${data.longestStreak === 1 ? "" : "s"}`}
                />
                <StatCard
                  label="Completed"
                  value={`${data.totalCompletions} / ${data.totalScheduled}`}
                />
                <StatCard
                  label="Completion rate"
                  value={`${Math.round(data.completionRate * 100)}%`}
                />
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-medium">Heatmap</h3>
                <Heatmap daily={data.daily} color={habitColor} />
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span
                      className="size-2 rounded-[2px]"
                      style={{
                        backgroundColor:
                          habitColor ?? "var(--color-primary)",
                      }}
                    />
                    Done
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className="size-2 rounded-[2px] opacity-30"
                      style={{ backgroundColor: "var(--color-muted-foreground)" }}
                    />
                    Missed
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className="size-2 rounded-[2px] opacity-10"
                      style={{ backgroundColor: "var(--color-muted-foreground)" }}
                    />
                    Off
                  </span>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-medium">Weekly completion %</h3>
                <WeeklyBars weekly={data.weekly} color={habitColor} />
              </section>
            </>
          )}
        </div>
        <div className={cn("hidden")} />
      </SheetContent>
    </Sheet>
  );
}
