import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserResponse } from "@/features/auth/types";

interface AuthSnapshot {
  user: UserResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
}

interface AuthState extends AuthSnapshot {
  hasHydrated: boolean;
  setAuth: (snapshot: AuthSnapshot) => void;
  clearAuth: () => void;
  setHasHydrated: (v: boolean) => void;
}

const EMPTY: AuthSnapshot = {
  user: null,
  accessToken: null,
  refreshToken: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...EMPTY,
      hasHydrated: false,
      setAuth: (snapshot) => set(snapshot),
      clearAuth: () => set(EMPTY),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "rm.auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
