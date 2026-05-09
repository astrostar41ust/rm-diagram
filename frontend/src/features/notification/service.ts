import { api } from "@/lib/api";
import type { NotificationResponse } from "./types";

export async function getNotifications(): Promise<NotificationResponse> {
  const res = await api.get<NotificationResponse>("/api/v1/notifications");
  return res.data;
}
