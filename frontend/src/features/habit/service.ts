import { api } from "@/lib/api";
import type {
  HabitResponse,
  CreateHabitRequest,
  UpdateHabitRequest,
  HabitLogResponse,
  CreateHabitLogRequest,
} from "./types";

export async function getHabits(): Promise<HabitResponse[]> {
  const res = await api.get<HabitResponse[]>("/api/v1/habits");
  return res.data;
}

export async function getHabit(id: number): Promise<HabitResponse> {
  const res = await api.get<HabitResponse>(`/api/v1/habits/${id}`);
  return res.data;
}

export async function createHabit(
  data: CreateHabitRequest,
): Promise<HabitResponse> {
  const res = await api.post<HabitResponse>("/api/v1/habits", data);
  return res.data;
}

export async function updateHabit(
  id: number,
  data: UpdateHabitRequest,
): Promise<HabitResponse> {
  const res = await api.put<HabitResponse>(`/api/v1/habits/${id}`, data);
  return res.data;
}

export async function deleteHabit(id: number): Promise<void> {
  await api.delete(`/api/v1/habits/${id}`);
}

export async function getHabitLogs(habitId: number): Promise<HabitLogResponse[]> {
  const res = await api.get<HabitLogResponse[]>(
    `/api/v1/habits/${habitId}/logs`,
  );
  return res.data;
}

export async function createHabitLog(
  data: CreateHabitLogRequest,
): Promise<HabitLogResponse> {
  const res = await api.post<HabitLogResponse>(
    `/api/v1/habits/${data.habitId}/logs`,
    data,
  );
  return res.data;
}
