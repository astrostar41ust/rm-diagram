"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useThemeStore } from "@/stores/theme";
import { Toaster } from "@/components/ui/toaster";

function ThemeHydrator() {
  const hydrate = useThemeStore((s) => s.hydrate);
  useEffect(() => hydrate(), [hydrate]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeHydrator />
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
