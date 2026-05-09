import { useQuery } from "@tanstack/react-query";
import { getDay } from "./service";

export const dayKeys = {
  all: ["day"] as const,
  byDate: (date: string) => ["day", date] as const,
};

export function useDay(date: string) {
  return useQuery({
    queryKey: dayKeys.byDate(date),
    queryFn: () => getDay(date),
  });
}
