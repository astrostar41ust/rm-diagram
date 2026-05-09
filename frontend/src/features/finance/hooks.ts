import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
} from "./service";

export const financeKeys = {
  categories: ["finance", "categories"] as const,
  transactions: (page: number, size: number, categoryId?: number) =>
    ["finance", "transactions", page, size, categoryId ?? null] as const,
  transactionsAll: ["finance", "transactions"] as const,
  summary: (year: number) => ["finance", "summary", year] as const,
  summaryAll: ["finance", "summary"] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: financeKeys.categories,
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTransactions(page = 0, size = 20, categoryId?: number) {
  return useQuery({
    queryKey: financeKeys.transactions(page, size, categoryId),
    queryFn: () => getTransactions(page, size, categoryId),
    placeholderData: (prev) => prev,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.transactionsAll });
      qc.invalidateQueries({ queryKey: financeKeys.summaryAll });
    },
  });
}

export function useUpdateTransaction(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateTransaction>[1]) =>
      updateTransaction(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.transactionsAll });
      qc.invalidateQueries({ queryKey: financeKeys.summaryAll });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.transactionsAll });
      qc.invalidateQueries({ queryKey: financeKeys.summaryAll });
    },
  });
}

export function useMonthlySummary(year: number) {
  return useQuery({
    queryKey: financeKeys.summary(year),
    queryFn: () => getMonthlySummary(year),
  });
}
