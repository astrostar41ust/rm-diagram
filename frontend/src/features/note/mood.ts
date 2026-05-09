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
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    value: "OKAY",
    label: "Okay",
    emoji: "😐",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
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
