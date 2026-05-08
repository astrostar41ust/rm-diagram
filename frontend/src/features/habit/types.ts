export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY";

export interface HabitResponse {
  id: number;
  name: string;
  description: string;
  frequency: Frequency;
  createdAt: string;
}

export interface CreateHabitRequest {
  name: string;
  description: string;
  frequency: Frequency;
}

export interface UpdateHabitRequest {
  name?: string;
  description?: string;
  frequency?: Frequency;
}

export interface HabitLogResponse {
  id: number;
  habitId: number;
  completedAt: string;
  note: string | null;
}

export interface CreateHabitLogRequest {
  habitId: number;
  completedAt: string;
  note?: string;
}
