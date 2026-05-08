import { api } from "@/lib/api";
import type {
  GoalResponse,
  CreateGoalRequest,
  UpdateGoalRequest,
} from "./types";

export async function getGoals(): Promise<GoalResponse[]> {
  const res = await api.get<GoalResponse[]>("/api/v1/goals");
  return res.data;
}

export async function getGoal(id: number): Promise<GoalResponse> {
  const res = await api.get<GoalResponse>(`/api/v1/goals/${id}`);
  return res.data;
}

export async function createGoal(
  data: CreateGoalRequest,
): Promise<GoalResponse> {
  const res = await api.post<GoalResponse>("/api/v1/goals", data);
  return res.data;
}

export async function updateGoal(
  id: number,
  data: UpdateGoalRequest,
): Promise<GoalResponse> {
  const res = await api.put<GoalResponse>(`/api/v1/goals/${id}`, data);
  return res.data;
}

export async function deleteGoal(id: number): Promise<void> {
  await api.delete(`/api/v1/goals/${id}`);
}
