export type FrequencyType = "DAILY" | "SPECIFIC_DAYS" | "CUSTOM";

export interface HabitResponse {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  frequencyType: FrequencyType;
  scheduleDays: string | null;
  reminderEnabled: boolean;
  reminderTime: string | null;
  archived: boolean;
  createdAt: string;
}

export interface CreateHabitRequest {
  name: string;
  icon?: string;
  color?: string;
  frequencyType: FrequencyType;
  scheduleDays?: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
}

export interface UpdateHabitRequest {
  name?: string;
  icon?: string;
  color?: string;
  frequencyType?: FrequencyType;
  scheduleDays?: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
}

export interface HabitGridItem {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  frequencyType: FrequencyType;
  scheduleDays: string | null;
  reminderEnabled: boolean;
  reminderTime: string | null;
  streak: number;
  completions: string[];
}

export interface GridResponse {
  habits: HabitGridItem[];
}

export interface ToggleResponse {
  completed: boolean;
}

export interface DailyPoint {
  date: string;
  completed: boolean;
  scheduled: boolean;
}

export interface WeeklyPoint {
  weekStart: string;
  completed: number;
  scheduled: number;
}

export interface HabitAnalytics {
  habitId: number;
  name: string;
  windowDays: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  totalScheduled: number;
  completionRate: number;
  daily: DailyPoint[];
  weekly: WeeklyPoint[];
}
