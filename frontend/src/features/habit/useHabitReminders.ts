"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { useHabitGrid } from "./hooks";

const DAY_NAMES = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

function isScheduledToday(
  frequencyType: string,
  scheduleDays: string | null,
  date: Date,
): boolean {
  if (frequencyType === "DAILY") return true;
  if (frequencyType === "SPECIFIC_DAYS" && scheduleDays) {
    const today = DAY_NAMES[date.getDay()];
    return scheduleDays
      .split(",")
      .map((d) => d.trim().toUpperCase())
      .includes(today);
  }
  return false;
}

export function useHabitReminders() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data } = useHabitGrid(today, today);
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    const habits = data?.habits ?? [];
    if (habits.length === 0) return;

    const tick = () => {
      const now = new Date();
      const currentHM = format(now, "HH:mm");
      const dateKey = format(now, "yyyy-MM-dd");

      for (const habit of habits) {
        if (!habit.reminderEnabled || !habit.reminderTime) continue;
        const hm = habit.reminderTime.slice(0, 5);
        if (hm !== currentHM) continue;
        if (!isScheduledToday(habit.frequencyType, habit.scheduleDays, now))
          continue;
        if (habit.completions.includes(dateKey)) continue;

        const key = `${habit.id}-${dateKey}-${hm}`;
        if (firedRef.current.has(key)) continue;
        firedRef.current.add(key);

        if (Notification.permission === "granted") {
          new Notification("Habit reminder", {
            body: `Time for: ${habit.name}`,
            tag: key,
          });
        }
      }
    };

    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [data]);
}
