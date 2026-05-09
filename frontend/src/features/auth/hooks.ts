import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login, register, refreshToken, logout } from "./service";
import { useAuthStore } from "@/stores/authStore";

export function useLogin() {
  return useMutation({ mutationFn: login });
}

export function useRegister() {
  return useMutation({ mutationFn: register });
}

export function useRefreshToken() {
  return useMutation({ mutationFn: refreshToken });
}

export function useCurrentUser() {
  return useAuthStore((s) => s.user);
}

export function useLogout() {
  const router = useRouter();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => router.replace("/login"),
  });
}
