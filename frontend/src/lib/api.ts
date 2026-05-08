import axios, { AxiosError } from "axios";
import type { AuthResponse } from "@/features/auth/types";

const ACCESS_TOKEN_KEY = "rm.accessToken";
const REFRESH_TOKEN_KEY = "rm.refreshToken";

export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens(accessToken: string, refreshToken: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const url = response.config.url ?? "";
    const isAuthEndpoint =
      url.includes("/api/v1/auth/login") ||
      url.includes("/api/v1/auth/register") ||
      url.includes("/api/v1/auth/refresh");
    if (isAuthEndpoint) {
      const data = response.data as AuthResponse | undefined;
      if (data?.accessToken && data?.refreshToken) {
        tokenStorage.setTokens(data.accessToken, data.refreshToken);
      }
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
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
