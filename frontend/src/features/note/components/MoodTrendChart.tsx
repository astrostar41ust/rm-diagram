"use client";

import { useMemo } from "react";
import { addDays, format, subDays } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useMoodTrend } from "../hooks";
import { moodConfig } from "../mood";
import type { Mood, MoodPoint } from "../types";

const WINDOW_DAYS = 30;

const MOOD_DOT_CLASS: Record<Mood, string> = {
  GREAT: "bg-green-500",
  GOOD: "bg-blue-500",
  OKAY: "bg-yellow-500",
  BAD: "bg-red-500",
};

const MOOD_SCORE: Record<Mood, number> = {
  GREAT: 4,
  GOOD: 3,
  OKAY: 2,
  BAD: 1,
};

interface DayCell {
  iso: string;
  date: Date;
  mood: Mood | null;
  count: number;
}

function buildDays(points: MoodPoint[]): DayCell[] {
  const map = new Map<string, MoodPoint>();
  for (const p of points) map.set(p.date, p);

  const today = new Date();
  const start = subDays(today, WINDOW_DAYS - 1);
  const cells: DayCell[] = [];
  for (let i = 0; i < WINDOW_DAYS; i++) {
    const date = addDays(start, i);
    const iso = format(date, "yyyy-MM-dd");
    const point = map.get(iso) ?? null;
    cells.push({
      iso,
      date,
      mood: point?.mood ?? null,
      count: point?.count ?? 0,
    });
  }
  return cells;
}

function averageLabel(score: number): string {
  if (score === 0) return "—";
  if (score >= 3.5) return "Great";
  if (score >= 2.5) return "Good";
  if (score >= 1.5) return "Okay";
  return "Bad";
}

export function MoodTrendChart() {
  const { data, isLoading } = useMoodTrend(WINDOW_DAYS);

  const cells = useMemo(() => buildDays(data?.points ?? []), [data?.points]);
  const totalEntries = data?.totalEntries ?? 0;
  const avgScore = data?.averageScore ?? 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood</CardTitle>
        <CardDescription>
          {totalEntries === 0
            ? "Tag your notes with a mood to see your trend."
            : `${totalEntries} entr${totalEntries === 1 ? "y" : "ies"} in the last ${WINDOW_DAYS} days · average ${averageLabel(avgScore)}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${WINDOW_DAYS}, minmax(0, 1fr))`,
          }}
        >
          {cells.map((cell) => (
            <MoodCell key={cell.iso} cell={cell} />
          ))}
        </div>
        <Legend />
      </CardContent>
    </Card>
  );
}

function MoodCell({ cell }: { cell: DayCell }) {
  const config = cell.mood ? moodConfig(cell.mood) : null;
  const dateLabel = format(cell.date, "MMM d, yyyy");
  const title = cell.mood
    ? `${dateLabel} — ${config?.label ?? cell.mood}${cell.count > 1 ? ` (${cell.count} notes)` : ""}`
    : `${dateLabel} — no entry`;

  return (
    <div
      title={title}
      className={cn(
        "flex aspect-square items-center justify-center rounded-md text-[11px] font-medium",
        cell.mood
          ? `${MOOD_DOT_CLASS[cell.mood]} text-white`
          : "bg-muted text-muted-foreground/40",
      )}
    >
      {config?.emoji ?? format(cell.date, "d")}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
      {(Object.keys(MOOD_SCORE) as Mood[])
        .sort((a, b) => MOOD_SCORE[b] - MOOD_SCORE[a])
        .map((m) => {
          const cfg = moodConfig(m);
          return (
            <span key={m} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "size-3 rounded-sm",
                  MOOD_DOT_CLASS[m],
                )}
              />
              {cfg.label}
            </span>
          );
        })}
      <span className="flex items-center gap-1.5">
        <span className="size-3 rounded-sm bg-muted" />
        No entry
      </span>
    </div>
  );
}
