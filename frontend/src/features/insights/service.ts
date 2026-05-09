import { api } from "@/lib/api";
import type { InsightsResponse } from "./types";

export async function getInsights(): Promise<InsightsResponse> {
  const res = await api.get<InsightsResponse>("/api/v1/insights");
  return res.data;
}
