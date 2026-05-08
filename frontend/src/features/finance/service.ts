import { api } from "@/lib/api";
import type {
  TransactionResponse,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionSummary,
} from "./types";

export async function getTransactions(): Promise<TransactionResponse[]> {
  const res = await api.get<TransactionResponse[]>("/api/v1/transactions");
  return res.data;
}

export async function getTransaction(
  id: number,
): Promise<TransactionResponse> {
  const res = await api.get<TransactionResponse>(`/api/v1/transactions/${id}`);
  return res.data;
}

export async function createTransaction(
  data: CreateTransactionRequest,
): Promise<TransactionResponse> {
  const res = await api.post<TransactionResponse>(
    "/api/v1/transactions",
    data,
  );
  return res.data;
}

export async function updateTransaction(
  id: number,
  data: UpdateTransactionRequest,
): Promise<TransactionResponse> {
  const res = await api.put<TransactionResponse>(
    `/api/v1/transactions/${id}`,
    data,
  );
  return res.data;
}

export async function deleteTransaction(id: number): Promise<void> {
  await api.delete(`/api/v1/transactions/${id}`);
}

export async function getTransactionSummary(): Promise<TransactionSummary> {
  const res = await api.get<TransactionSummary>(
    "/api/v1/transactions/summary",
  );
  return res.data;
}
