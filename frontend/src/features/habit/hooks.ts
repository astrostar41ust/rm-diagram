import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  getHabitLogs,
  createHabitLog,
} from "./service";

const keys = {
  all: ["habits"] as const,
  detail: (id: number) => ["habits", id] as const,
  logs: (habitId: number) => ["habits", habitId, "logs"] as const,
};

export function useHabits() {
  return useQuery({ queryKey: keys.all, queryFn: getHabits });
}

export function useHabit(id: number) {
  return useQuery({ queryKey: keys.detail(id), queryFn: () => getHabit(id) });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createHabit,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateHabit(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateHabit>[1]) =>
      updateHabit(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.detail(id) });
    },
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteHabit,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useHabitLogs(habitId: number) {
  return useQuery({
    queryKey: keys.logs(habitId),
    queryFn: () => getHabitLogs(habitId),
  });
}

export function useCreateHabitLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createHabitLog,
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: keys.logs(variables.habitId) }),
  });
}
