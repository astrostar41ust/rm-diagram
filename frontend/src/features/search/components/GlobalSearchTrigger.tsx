"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { GlobalSearchPalette } from "./GlobalSearchPalette";

export function GlobalSearchTrigger() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isCmdK =
        (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs text-muted-foreground transition-colors hover:bg-muted sm:inline-flex"
        aria-label="Open global search"
      >
        <Search className="size-3.5" />
        <span>Search…</span>
        <kbd className="ml-2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>
      <GlobalSearchPalette open={open} onOpenChange={setOpen} />
    </>
  );
}
