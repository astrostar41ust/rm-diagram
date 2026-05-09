import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBudget,
  deleteBudget,
  getBudgets,
  updateBudget,
} from "./service";

export const budgetKeys = {
  all: ["budgets"] as const,
  list: () => ["budgets", "list"] as const,
};

export function useBudgets() {
  return useQuery({
    queryKey: budgetKeys.list(),
    queryFn: getBudgets,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBudget,
    onSuccess: () => qc.invalidateQueries({ queryKey: budgetKeys.all }),
  });
}

export function useUpdateBudget(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateBudget>[1]) =>
      updateBudget(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: budgetKeys.all }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => qc.invalidateQueries({ queryKey: budgetKeys.all }),
  });
}
