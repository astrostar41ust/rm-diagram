import { api } from "@/lib/api";
import type { ExportPayload, ImportSummary } from "./types";

export async function exportData(): Promise<Blob> {
  const res = await api.get("/api/v1/data/export", { responseType: "blob" });
  return res.data as Blob;
}

export async function importData(payload: ExportPayload): Promise<ImportSummary> {
  const res = await api.post<ImportSummary>("/api/v1/data/import", payload);
  return res.data;
}
