import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  addMilestone,
  toggleMilestone,
  deleteMilestone,
} from "./service";
import type { GoalStatus } from "./types";

export const goalKeys = {
  all: ["goals"] as const,
  list: (status?: GoalStatus) => ["goals", "list", status ?? null] as const,
  detail: (id: number) => ["goals", "detail", id] as const,
};

export function useGoals(status?: GoalStatus) {
  return useQuery({
    queryKey: goalKeys.list(status),
    queryFn: () => getGoals(status),
    placeholderData: (prev) => prev,
  });
}

export function useGoal(id: number) {
  return useQuery({
    queryKey: goalKeys.detail(id),
    queryFn: () => getGoalById(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createGoal,
    onSuccess: () => qc.invalidateQueries({ queryKey: goalKeys.all }),
  });
}

export function useUpdateGoal(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateGoal>[1]) => updateGoal(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: goalKeys.all });
      qc.invalidateQueries({ queryKey: goalKeys.detail(id) });
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => qc.invalidateQueries({ queryKey: goalKeys.all }),
  });
}

export function useAddMilestone(goalId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof addMilestone>[1]) =>
      addMilestone(goalId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: goalKeys.all }),
  });
}

export function useToggleMilestone(goalId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (milestoneId: number) => toggleMilestone(goalId, milestoneId),
    onSuccess: () => qc.invalidateQueries({ queryKey: goalKeys.all }),
  });
}

export function useDeleteMilestone(goalId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (milestoneId: number) => deleteMilestone(goalId, milestoneId),
    onSuccess: () => qc.invalidateQueries({ queryKey: goalKeys.all }),
  });
}
