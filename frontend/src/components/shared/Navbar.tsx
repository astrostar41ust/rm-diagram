"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PanelLeft, User, Sun, Moon, LogOut } from "lucide-react";
import { tokenStorage } from "@/lib/api";
import { useSidebarStore } from "@/stores/sidebar";
import { useThemeStore } from "@/stores/theme";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const router = useRouter();
  const toggleSidebar = useSidebarStore((s) => s.toggle);
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
    tokenStorage.clear();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center border-b border-border bg-card px-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <PanelLeft className="size-5" />
      </Button>

      <div className="ml-auto relative" ref={menuRef}>
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
                router.push("/profile");
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-popover-foreground hover:bg-muted"
            >
              <User className="size-4" />
              Profile
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
