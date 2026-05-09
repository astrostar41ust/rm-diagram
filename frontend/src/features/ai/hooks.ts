import { useMutation } from "@tanstack/react-query";
import {
  generatePrompt,
  generateWeekSummary,
  suggestCategory,
} from "./service";

export function useWeekSummary() {
  return useMutation({ mutationFn: generateWeekSummary });
}

export function useGeneratePrompt() {
  return useMutation({ mutationFn: generatePrompt });
}

export function useSuggestCategory() {
  return useMutation({ mutationFn: suggestCategory });
}
