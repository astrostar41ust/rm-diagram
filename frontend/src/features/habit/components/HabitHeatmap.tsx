"use client";

import { useMemo } from "react";
import {
  addDays,
  format,
  startOfWeek,
  subDays,
} from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useHabitGrid } from "../hooks";

const WEEKS = 53;
const DAYS_PER_WEEK = 7;

interface DayCell {
  date: Date;
  iso: string;
  count: number;
  inRange: boolean;
}

function intensityClass(count: number, max: number): string {
  if (count === 0) return "bg-muted/60";
  if (max <= 1) return "bg-emerald-500";
  const ratio = count / max;
  if (ratio < 0.25) return "bg-emerald-500/30";
  if (ratio < 0.5) return "bg-emerald-500/55";
  if (ratio < 0.75) return "bg-emerald-500/75";
  return "bg-emerald-500";
}

export function HabitHeatmap() {
  const today = useMemo(() => new Date(), []);
  const startDate = useMemo(() => {
    const earliest = subDays(today, WEEKS * DAYS_PER_WEEK - 1);
    return startOfWeek(earliest, { weekStartsOn: 0 });
  }, [today]);

  const fromIso = format(startDate, "yyyy-MM-dd");
  const toIso = format(today, "yyyy-MM-dd");

  const { data, isLoading } = useHabitGrid(fromIso, toIso);

  const { weeks, totalCompletions, maxCount, monthLabels } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const habit of data?.habits ?? []) {
      for (const iso of habit.completions) {
        counts.set(iso, (counts.get(iso) ?? 0) + 1);
      }
    }

    const grid: DayCell[][] = [];
    let max = 0;
    let total = 0;
    const labels: { col: number; label: string }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < WEEKS; w++) {
      const col: DayCell[] = [];
      for (let d = 0; d < DAYS_PER_WEEK; d++) {
        const date = addDays(startDate, w * DAYS_PER_WEEK + d);
        const iso = format(date, "yyyy-MM-dd");
        const count = counts.get(iso) ?? 0;
        const inRange = date <= today;
        if (inRange) {
          total += count;
          if (count > max) max = count;
        }
        col.push({ date, iso, count, inRange });

        if (d === 0) {
          const month = date.getMonth();
          if (month !== lastMonth) {
            labels.push({ col: w, label: format(date, "MMM") });
            lastMonth = month;
          }
        }
      }
      grid.push(col);
    }

    return { weeks: grid, totalCompletions: total, maxCount: max, monthLabels: labels };
  }, [data, startDate, today]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-[120px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-xs text-muted-foreground">
        <span>
          <span className="font-medium text-foreground tabular-nums">
            {totalCompletions}
          </span>{" "}
          completions in the last year
        </span>
        <Legend />
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div
            className="grid grid-cols-[auto_1fr] gap-x-1.5"
            style={{ minWidth: WEEKS * 14 + 24 }}
          >
            <div />
            <MonthRow labels={monthLabels} totalWeeks={WEEKS} />

            <DayLabels />
            <WeekGrid weeks={weeks} maxCount={maxCount} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthRow({
  labels,
  totalWeeks,
}: {
  labels: { col: number; label: string }[];
  totalWeeks: number;
}) {
  return (
    <div
      className="grid h-4 text-[10px] text-muted-foreground"
      style={{ gridTemplateColumns: `repeat(${totalWeeks}, 12px)`, columnGap: 2 }}
    >
      {Array.from({ length: totalWeeks }, (_, w) => {
        const label = labels.find((l) => l.col === w)?.label;
        return (
          <span key={w} className="col-span-1">
            {label ?? ""}
          </span>
        );
      })}
    </div>
  );
}

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""] as const;

function DayLabels() {
  return (
    <div className="grid grid-rows-7 gap-[2px] pr-1 text-[10px] text-muted-foreground">
      {DAY_LABELS.map((label, i) => (
        <span key={i} className="flex h-3 items-center leading-none">
          {label}
        </span>
      ))}
    </div>
  );
}

function WeekGrid({ weeks, maxCount }: { weeks: DayCell[][]; maxCount: number }) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${weeks.length}, 12px)`,
        columnGap: 2,
      }}
    >
      {weeks.map((col, wIdx) => (
        <div key={wIdx} className="grid grid-rows-7 gap-[2px]">
          {col.map((cell) => (
            <div
              key={cell.iso}
              className={
                cell.inRange
                  ? `size-3 rounded-[2px] ${intensityClass(cell.count, maxCount)}`
                  : "size-3 rounded-[2px] bg-transparent"
              }
              title={
                cell.inRange
                  ? `${format(cell.date, "MMM d, yyyy")} — ${cell.count} completion${cell.count === 1 ? "" : "s"}`
                  : undefined
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function Legend() {
  return (
    <span className="flex items-center gap-1.5">
      Less
      <span className="size-3 rounded-[2px] bg-muted/60" />
      <span className="size-3 rounded-[2px] bg-emerald-500/30" />
      <span className="size-3 rounded-[2px] bg-emerald-500/55" />
      <span className="size-3 rounded-[2px] bg-emerald-500/75" />
      <span className="size-3 rounded-[2px] bg-emerald-500" />
      More
    </span>
  );
}
