import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "./service";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => ["notifications", "list"] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: getNotifications,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
