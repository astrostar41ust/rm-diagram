export type Role = "USER" | "ADMIN";

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  role: Role;
}

export type User = UserResponse;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  firstname: string;
  lastname: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}
