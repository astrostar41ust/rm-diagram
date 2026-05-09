import { api } from "@/lib/api";
import type {
  HabitResponse,
  CreateHabitRequest,
  UpdateHabitRequest,
  GridResponse,
  ToggleResponse,
  HabitAnalytics,
} from "./types";

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
  const res = await api.patch<HabitResponse>(`/api/v1/habits/${id}`, data);
  return res.data;
}

export async function deleteHabit(id: number): Promise<void> {
  await api.delete(`/api/v1/habits/${id}`);
}

export async function getGrid(
  from: string,
  to: string,
): Promise<GridResponse> {
  const res = await api.get<GridResponse>("/api/v1/habits/grid", {
    params: { from, to },
  });
  return res.data;
}

export async function toggleCompletion(
  habitId: number,
  date: string,
): Promise<ToggleResponse> {
  const res = await api.post<ToggleResponse>(
    `/api/v1/habits/${habitId}/toggle`,
    null,
    { params: { date } },
  );
  return res.data;
}

export async function getHabitAnalytics(
  habitId: number,
  days = 180,
): Promise<HabitAnalytics> {
  const res = await api.get<HabitAnalytics>(
    `/api/v1/habits/${habitId}/analytics`,
    { params: { days } },
  );
  return res.data;
}
