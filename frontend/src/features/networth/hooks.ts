import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAccount,
  deleteAccount,
  getOverview,
  snapshotToday,
  updateAccount,
} from "./service";

export const networthKeys = {
  all: ["networth"] as const,
  overview: () => ["networth", "overview"] as const,
};

export function useNetWorth() {
  return useQuery({
    queryKey: networthKeys.overview(),
    queryFn: getOverview,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: networthKeys.all }),
  });
}

export function useUpdateAccount(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateAccount>[1]) =>
      updateAccount(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: networthKeys.all }),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: networthKeys.all }),
  });
}

export function useSnapshotToday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: snapshotToday,
    onSuccess: () => qc.invalidateQueries({ queryKey: networthKeys.all }),
  });
}
