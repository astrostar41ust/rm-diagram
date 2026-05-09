import { api } from "@/lib/api";
import type {
  Category,
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  MonthlySummary,
  PageResponse,
} from "./types";

export async function getCategories(): Promise<Category[]> {
  const res = await api.get<Category[]>("/api/v1/categories");
  return res.data;
}

export async function getTransactions(
  page = 0,
  size = 20,
  categoryId?: number,
): Promise<PageResponse<Transaction>> {
  const res = await api.get<PageResponse<Transaction>>("/api/v1/transactions", {
    params: { page, size, ...(categoryId ? { categoryId } : {}) },
  });
  return res.data;
}

export async function createTransaction(
  data: CreateTransactionRequest,
): Promise<Transaction> {
  const res = await api.post<Transaction>("/api/v1/transactions", data);
  return res.data;
}

export async function updateTransaction(
  id: number,
  data: UpdateTransactionRequest,
): Promise<Transaction> {
  const res = await api.patch<Transaction>(`/api/v1/transactions/${id}`, data);
  return res.data;
}

export async function deleteTransaction(id: number): Promise<void> {
  await api.delete(`/api/v1/transactions/${id}`);
}

export async function getMonthlySummary(year: number): Promise<MonthlySummary[]> {
  const res = await api.get<MonthlySummary[]>("/api/v1/transactions/summary", {
    params: { year },
  });
  return res.data;
}
