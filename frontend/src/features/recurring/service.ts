import { api } from "@/lib/api";
import type {
  CreateRecurringRequest,
  RecurringTransaction,
  UpdateRecurringRequest,
} from "./types";

const BASE = "/api/v1/recurring-transactions";

export async function listRecurring(): Promise<RecurringTransaction[]> {
  const res = await api.get<RecurringTransaction[]>(BASE);
  return res.data;
}

export async function createRecurring(
  data: CreateRecurringRequest,
): Promise<RecurringTransaction> {
  const res = await api.post<RecurringTransaction>(BASE, data);
  return res.data;
}

export async function updateRecurring(
  id: number,
  data: UpdateRecurringRequest,
): Promise<RecurringTransaction> {
  const res = await api.patch<RecurringTransaction>(`${BASE}/${id}`, data);
  return res.data;
}

export async function deleteRecurring(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`);
}
