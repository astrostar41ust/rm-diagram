import type { Mood } from "./types";

export const MOOD_OPTIONS: {
  value: Mood;
  label: string;
  emoji: string;
  className: string;
}[] = [
  {
    value: "GREAT",
    label: "Great",
    emoji: "😄",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  {
    value: "GOOD",
    label: "Good",
    emoji: "🙂",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  {
    value: "OKAY",
    label: "Okay",
    emoji: "😐",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    value: "BAD",
    label: "Bad",
    emoji: "😞",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
];

export function moodConfig(mood: Mood) {
  return MOOD_OPTIONS.find((m) => m.value === mood) ?? MOOD_OPTIONS[2];
}

export function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
