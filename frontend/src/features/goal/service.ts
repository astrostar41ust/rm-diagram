import { api } from "@/lib/api";
import type {
  Goal,
  GoalStatus,
  CreateGoalRequest,
  CreateMilestoneRequest,
  UpdateGoalRequest,
} from "./types";

export async function getGoals(status?: GoalStatus): Promise<Goal[]> {
  const res = await api.get<Goal[]>("/api/v1/goals", {
    params: status ? { status } : undefined,
  });
  return res.data;
}

export async function getGoalById(id: number): Promise<Goal> {
  const res = await api.get<Goal>(`/api/v1/goals/${id}`);
  return res.data;
}

export async function createGoal(data: CreateGoalRequest): Promise<Goal> {
  const res = await api.post<Goal>("/api/v1/goals", data);
  return res.data;
}

export async function updateGoal(
  id: number,
  data: UpdateGoalRequest,
): Promise<Goal> {
  const res = await api.patch<Goal>(`/api/v1/goals/${id}`, data);
  return res.data;
}

export async function deleteGoal(id: number): Promise<void> {
  await api.delete(`/api/v1/goals/${id}`);
}

export async function addMilestone(
  goalId: number,
  data: CreateMilestoneRequest,
): Promise<Goal> {
  const res = await api.post<Goal>(`/api/v1/goals/${goalId}/milestones`, data);
  return res.data;
}

export async function toggleMilestone(
  goalId: number,
  milestoneId: number,
): Promise<Goal> {
  const res = await api.patch<Goal>(
    `/api/v1/goals/${goalId}/milestones/${milestoneId}/toggle`,
  );
  return res.data;
}

export async function deleteMilestone(
  goalId: number,
  milestoneId: number,
): Promise<void> {
  await api.delete(`/api/v1/goals/${goalId}/milestones/${milestoneId}`);
}
