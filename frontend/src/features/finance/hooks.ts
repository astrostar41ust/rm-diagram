import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
} from "./service";

const keys = {
  all: ["transactions"] as const,
  detail: (id: number) => ["transactions", id] as const,
  summary: ["transactions", "summary"] as const,
};

export function useTransactions() {
  return useQuery({ queryKey: keys.all, queryFn: getTransactions });
}

export function useTransaction(id: number) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => getTransaction(id),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.summary });
    },
  });
}

export function useUpdateTransaction(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateTransaction>[1]) =>
      updateTransaction(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      qc.invalidateQueries({ queryKey: keys.summary });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.summary });
    },
  });
}

export function useTransactionSummary() {
  return useQuery({
    queryKey: keys.summary,
    queryFn: getTransactionSummary,
  });
}
