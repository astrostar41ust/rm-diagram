"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useThemeStore } from "@/stores/theme";

export function Toaster() {
  const theme = useThemeStore((s) => s.theme);
  return (
    <SonnerToaster
      richColors
      closeButton
      position="top-right"
      theme={theme === "light" || theme === "dark" ? theme : "system"}
    />
  );
}
