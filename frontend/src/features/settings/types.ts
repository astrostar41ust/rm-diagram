export type Theme = "system" | "light" | "dark";

export type Currency = "THB" | "USD" | "EUR" | "JPY";

export interface Settings {
  id: number;
  currency: string;
  monthlyBudget: number | null;
  theme: string;
  updatedAt: string;
}

export interface UpdateSettingsRequest {
  currency?: string;
  monthlyBudget?: number;
  theme?: string;
}

export interface UpdateProfileRequest {
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
