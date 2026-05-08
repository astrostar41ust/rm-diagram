export type FrequencyType = "DAILY" | "SPECIFIC_DAYS" | "CUSTOM";

export interface HabitResponse {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  frequencyType: FrequencyType;
  scheduleDays: string | null;
  archived: boolean;
  createdAt: string;
}

export interface CreateHabitRequest {
  name: string;
  icon?: string;
  color?: string;
  frequencyType: FrequencyType;
  scheduleDays?: string;
}

export interface UpdateHabitRequest {
  name?: string;
  icon?: string;
  color?: string;
  frequencyType?: FrequencyType;
  scheduleDays?: string;
}

export interface HabitGridItem {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  frequencyType: FrequencyType;
  scheduleDays: string | null;
  streak: number;
  completions: string[];
}

export interface GridResponse {
  habits: HabitGridItem[];
}

export interface ToggleResponse {
  completed: boolean;
}
