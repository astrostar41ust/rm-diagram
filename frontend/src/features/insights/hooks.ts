import { useQuery } from "@tanstack/react-query";
import { getInsights } from "./service";

export const insightsKeys = {
  all: ["insights"] as const,
};

export function useInsights() {
  return useQuery({
    queryKey: insightsKeys.all,
    queryFn: getInsights,
  });
}
