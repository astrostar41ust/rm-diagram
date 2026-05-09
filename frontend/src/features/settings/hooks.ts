import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSettings,
  updateSettings,
  updateProfile,
  changePassword,
  deleteAccount,
} from "./service";

export const settingsKeys = {
  settings: ["settings"] as const,
};

export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.settings,
    queryFn: getSettings,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: settingsKeys.settings }),
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: updateProfile,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: deleteAccount,
  });
}
