import { useQuery } from "@tanstack/react-query";
import { search } from "./service";

export const searchKeys = {
  all: ["search"] as const,
  query: (q: string) => ["search", q] as const,
};

export function useSearch(query: string) {
  return useQuery({
    queryKey: searchKeys.query(query),
    queryFn: () => search(query),
    enabled: query.trim().length > 0,
    staleTime: 5_000,
  });
}
