import { api } from "@/lib/api";
import type { DashboardResponse } from "./types";

export async function getDashboard(): Promise<DashboardResponse> {
  const res = await api.get<DashboardResponse>("/api/v1/dashboard");
  return res.data;
}
