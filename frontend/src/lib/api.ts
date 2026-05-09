import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import type { AuthResponse } from "@/features/auth/types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function isPublicAuthEndpoint(url: string) {
  return (
    url.includes("/api/v1/auth/login") ||
    url.includes("/api/v1/auth/register") ||
    url.includes("/api/v1/auth/refresh")
  );
}

api.interceptors.response.use(
  (response) => {
    const url = response.config.url ?? "";
    if (isPublicAuthEndpoint(url)) {
      const data = response.data as AuthResponse | undefined;
      if (data?.accessToken && data?.refreshToken) {
        useAuthStore.getState().setAuth({
          user: data.user ?? useAuthStore.getState().user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      }
    }
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";

    if (status === 401) {
      // AuthGuard will pick this up and redirect to /login.
      useAuthStore.getState().clearAuth();
    } else if (!isPublicAuthEndpoint(url)) {
      // Surface unexpected failures via toast. Auth-form errors are shown
      // inline by the form, so we suppress them here to avoid duplicates.
      toast.error(getApiErrorMessage(error));
    }
    return Promise.reject(error);
  },
);

export interface ApiError {
  code: string;
  message: string;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.message) return data.message;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
