import type { Mood } from "@/features/note/types";

export interface CategoryTotal {
  name: string;
  icon: string | null;
  color: string | null;
  total: number;
}

export interface HabitCompletionRate {
  id: number;
  name: string;
  completed: number;
  scheduled: number;
  rate: number;
}

export interface DailyMood {
  date: string;
  mood: Mood;
}

export interface GoalVelocity {
  id: number;
  title: string;
  progress: number;
  daysActive: number;
}

export interface InsightsResponse {
  baseCurrency: string;
  monthIncome: number;
  monthExpense: number;
  monthNet: number;
  topExpenseCategories: CategoryTotal[];
  habitCompletionRates: HabitCompletionRate[];
  moodCounts: Record<string, number>;
  moodHistory: DailyMood[];
  goalVelocities: GoalVelocity[];
}
