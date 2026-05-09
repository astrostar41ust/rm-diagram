import { useMutation } from "@tanstack/react-query";
import { generatePrompt, generateWeekSummary } from "./service";

export function useWeekSummary() {
  return useMutation({ mutationFn: generateWeekSummary });
}

export function useGeneratePrompt() {
  return useMutation({ mutationFn: generatePrompt });
}
