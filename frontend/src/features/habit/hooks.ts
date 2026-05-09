import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createHabit,
  updateHabit,
  deleteHabit,
  getGrid,
  toggleCompletion,
  getHabitAnalytics,
} from "./service";
import type { GridResponse } from "./types";

export const habitKeys = {
  grid: (from: string, to: string) => ["habits", "grid", from, to] as const,
  analytics: (id: number, days: number) =>
    ["habits", "analytics", id, days] as const,
};

export function useHabitAnalytics(id: number | null, days = 180) {
  return useQuery({
    queryKey: habitKeys.analytics(id ?? 0, days),
    queryFn: () => getHabitAnalytics(id as number, days),
    enabled: id != null && id > 0,
  });
}

export function useHabitGrid(from: string, to: string) {
  return useQuery({
    queryKey: habitKeys.grid(from, to),
    queryFn: () => getGrid(from, to),
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createHabit,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });
}

export function useUpdateHabit(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateHabit>[1]) =>
      updateHabit(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteHabit,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });
}

export function useToggleCompletion(from: string, to: string) {
  const qc = useQueryClient();
  const queryKey = habitKeys.grid(from, to);

  return useMutation({
    mutationFn: ({ habitId, date }: { habitId: number; date: string }) =>
      toggleCompletion(habitId, date),
    onMutate: async ({ habitId, date }) => {
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<GridResponse>(queryKey);

      qc.setQueryData<GridResponse>(queryKey, (old) => {
        if (!old) return old;
        return {
          habits: old.habits.map((h) => {
            if (h.id !== habitId) return h;
            const has = h.completions.includes(date);
            return {
              ...h,
              completions: has
                ? h.completions.filter((d) => d !== date)
                : [...h.completions, date],
            };
          }),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(queryKey, context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });
}
