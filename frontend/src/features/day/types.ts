import type { TransactionType } from "@/features/finance/types";
import type { Mood } from "@/features/note/types";
import type { GoalLinkType, GoalStatus } from "@/features/goal/types";

export interface DayHabit {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  scheduled: boolean;
  completed: boolean;
}

export interface DayTransaction {
  id: number;
  type: TransactionType;
  amount: number;
  currency: string;
  amountInBase: number;
  baseCurrency: string;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
  note: string | null;
}

export interface DayNote {
  id: number;
  title: string;
  content: string;
  mood: Mood | null;
  tags: string | null;
}

export interface DayGoal {
  id: number;
  title: string;
  status: GoalStatus;
  progress: number;
  linkType: GoalLinkType;
  targetDate: string | null;
}

export interface DayResponse {
  date: string;
  baseCurrency: string;
  habits: DayHabit[];
  transactions: DayTransaction[];
  totalIncome: number;
  totalExpense: number;
  notes: DayNote[];
  activeGoals: DayGoal[];
}
