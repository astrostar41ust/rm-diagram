import { api } from "@/lib/api";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
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
