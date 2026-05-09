import { api } from "@/lib/api";
import type {
  Account,
  CreateAccountRequest,
  NetWorthOverview,
  NetWorthSnapshot,
  UpdateAccountRequest,
} from "./types";

export async function getOverview(): Promise<NetWorthOverview> {
  const res = await api.get<NetWorthOverview>("/api/v1/net-worth");
  return res.data;
}

export async function createAccount(
  data: CreateAccountRequest,
): Promise<Account> {
  const res = await api.post<Account>("/api/v1/net-worth/accounts", data);
  return res.data;
}

export async function updateAccount(
  id: number,
  data: UpdateAccountRequest,
): Promise<Account> {
  const res = await api.patch<Account>(`/api/v1/net-worth/accounts/${id}`, data);
  return res.data;
}

export async function deleteAccount(id: number): Promise<void> {
  await api.delete(`/api/v1/net-worth/accounts/${id}`);
}

export async function snapshotToday(): Promise<NetWorthSnapshot> {
  const res = await api.post<NetWorthSnapshot>("/api/v1/net-worth/snapshots");
  return res.data;
}
