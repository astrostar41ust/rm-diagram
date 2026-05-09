import { api } from "@/lib/api";
import type { GenerateRequest, GenerateResponse } from "./types";

// Local LLM generation can take a while; bump the default timeout.
const AI_TIMEOUT_MS = 120_000;

export async function generateWeekSummary(): Promise<GenerateResponse> {
  const res = await api.post<GenerateResponse>(
    "/api/v1/ai/week-summary",
    null,
    { timeout: AI_TIMEOUT_MS },
  );
  return res.data;
}

export async function generatePrompt(
  data: GenerateRequest,
): Promise<GenerateResponse> {
  const res = await api.post<GenerateResponse>("/api/v1/ai/prompt", data, {
    timeout: AI_TIMEOUT_MS,
  });
  return res.data;
}
