"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Sun, Moon, LogOut, Settings } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/theme";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/features/notification/components/NotificationBell";
import { GlobalSearchTrigger } from "@/features/search/components/GlobalSearchTrigger";

export function Navbar() {
  const router = useRouter();
  const { theme, toggleTheme } = useThemeStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  function handleLogout() {
    useAuthStore.getState().clearAuth();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-end gap-2 border-b border-border bg-card px-4">
      <GlobalSearchTrigger />
      <NotificationBell />
      <div className="relative" ref={menuRef}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Open profile menu"
          aria-expanded={menuOpen}
        >
          <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="size-4" />
          </div>
        </Button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-popover p-1 shadow-lg">
            <button
              onClick={() => {
                setMenuOpen(false);
                router.push("/settings");
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-popover-foreground hover:bg-muted"
            >
              <Settings className="size-4" />
              Settings
            </button>
            <button
              onClick={() => {
                toggleTheme();
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-popover-foreground hover:bg-muted"
            >
              {theme === "light" ? (
                <Moon className="size-4" />
              ) : (
                <Sun className="size-4" />
              )}
              {theme === "light" ? "Dark mode" : "Light mode"}
            </button>
            <div className="my-1 h-px bg-border" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
