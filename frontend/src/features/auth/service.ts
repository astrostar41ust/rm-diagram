import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  User,
} from "./types";

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/v1/auth/login", data);
  return res.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/v1/auth/register", data);
  return res.data;
}

export async function refreshToken(
  data: RefreshTokenRequest,
): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/v1/auth/refresh", data);
  return res.data;
}

/**
 * Client-side logout: clears the persisted auth state.
 * No backend endpoint exists; if you want server-side refresh-token
 * revocation, add POST /api/v1/auth/logout that calls
 * RefreshTokenRepository.revokeAllByUserId.
 */
export async function logout(): Promise<void> {
  useAuthStore.getState().clearAuth();
}

/**
 * Returns the cached user from the auth store.
 * No backend /me endpoint exists yet — this is purely a read of what
 * login/register/refresh already populated. Add GET /api/v1/auth/me on
 * the backend if you want fresh server data.
 */
export async function getMe(): Promise<User | null> {
  return useAuthStore.getState().user;
}
