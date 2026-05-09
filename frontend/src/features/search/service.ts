import { api } from "@/lib/api";
import type { SearchResponse } from "./types";

export async function search(query: string): Promise<SearchResponse> {
  const res = await api.get<SearchResponse>("/api/v1/search", {
    params: { q: query },
  });
  return res.data;
}
