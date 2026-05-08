import { useMutation } from "@tanstack/react-query";
import { login, register, refreshToken } from "./service";

export function useLogin() {
  return useMutation({ mutationFn: login });
}

export function useRegister() {
  return useMutation({ mutationFn: register });
}

export function useRefreshToken() {
  return useMutation({ mutationFn: refreshToken });
}
