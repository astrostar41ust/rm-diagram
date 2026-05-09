import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRecurring,
  deleteRecurring,
  listRecurring,
  updateRecurring,
} from "./service";

export const recurringKeys = {
  all: ["recurring"] as const,
  list: () => ["recurring", "list"] as const,
};

export function useRecurring() {
  return useQuery({
    queryKey: recurringKeys.list(),
    queryFn: listRecurring,
  });
}

export function useCreateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRecurring,
    onSuccess: () => qc.invalidateQueries({ queryKey: recurringKeys.all }),
  });
}

export function useUpdateRecurring(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateRecurring>[1]) =>
      updateRecurring(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: recurringKeys.all }),
  });
}

export function useDeleteRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRecurring,
    onSuccess: () => qc.invalidateQueries({ queryKey: recurringKeys.all }),
  });
}
