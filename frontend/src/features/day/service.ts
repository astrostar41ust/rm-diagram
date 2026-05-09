import { api } from "@/lib/api";
import type { DayResponse } from "./types";

export async function getDay(date?: string): Promise<DayResponse> {
  const res = await api.get<DayResponse>("/api/v1/day", {
    params: date ? { date } : undefined,
  });
  return res.data;
}
