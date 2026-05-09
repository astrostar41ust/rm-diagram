import { api } from "@/lib/api";
import type {
  Budget,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from "./types";

export async function getBudgets(): Promise<Budget[]> {
  const res = await api.get<Budget[]>("/api/v1/budgets");
  return res.data;
}

export async function createBudget(data: CreateBudgetRequest): Promise<Budget> {
  const res = await api.post<Budget>("/api/v1/budgets", data);
  return res.data;
}

export async function updateBudget(
  id: number,
  data: UpdateBudgetRequest,
): Promise<Budget> {
  const res = await api.patch<Budget>(`/api/v1/budgets/${id}`, data);
  return res.data;
}

export async function deleteBudget(id: number): Promise<void> {
  await api.delete(`/api/v1/budgets/${id}`);
}
