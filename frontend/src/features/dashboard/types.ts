import type { Mood } from "@/features/note/types";

export interface HabitSummary {
  totalHabits: number;
  completedToday: number;
  bestStreak: number;
  bestStreakHabitName: string | null;
}

export interface FinanceSummary {
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNet: number;
}

export interface GoalSummary {
  totalActive: number;
  totalCompleted: number;
}

export interface NotePreview {
  id: number;
  title: string;
  mood: Mood | null;
  createdAt: string;
}

export interface DashboardResponse {
  habitSummary: HabitSummary;
  financeSummary: FinanceSummary;
  goalSummary: GoalSummary;
  recentNotes: NotePreview[];
}
