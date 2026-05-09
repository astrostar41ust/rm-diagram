import { api } from "@/lib/api";
import type {
  Settings,
  UpdateSettingsRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "./types";
import type { User } from "@/features/auth/types";

export async function getSettings(): Promise<Settings> {
  const res = await api.get<Settings>("/api/v1/settings");
  return res.data;
}

export async function updateSettings(
  data: UpdateSettingsRequest,
): Promise<Settings> {
  const res = await api.patch<Settings>("/api/v1/settings", data);
  return res.data;
}

/**
 * TODO: backend does not yet expose a profile-update endpoint.
 * Suggested route: PATCH /api/v1/users/me, returning the updated User.
 * Until that's added, this call will 404.
 */
export async function updateProfile(
  data: UpdateProfileRequest,
): Promise<User> {
  const res = await api.patch<User>("/api/v1/users/me", data);
  return res.data;
}

/**
 * TODO: backend does not yet expose a password-change endpoint.
 * Suggested route: POST /api/v1/auth/password (verifies current, sets new).
 * Until that's added, this call will 404.
 */
export async function changePassword(
  data: ChangePasswordRequest,
): Promise<void> {
  await api.post("/api/v1/auth/password", data);
}
