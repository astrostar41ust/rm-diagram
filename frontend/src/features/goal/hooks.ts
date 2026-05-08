import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
} from "./service";

const keys = {
  all: ["goals"] as const,
  detail: (id: number) => ["goals", id] as const,
};

export function useGoals() {
  return useQuery({ queryKey: keys.all, queryFn: getGoals });
}

export function useGoal(id: number) {
  return useQuery({ queryKey: keys.detail(id), queryFn: () => getGoal(id) });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createGoal,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateGoal(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateGoal>[1]) =>
      updateGoal(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.detail(id) });
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
