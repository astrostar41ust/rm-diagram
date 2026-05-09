"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  CircleDollarSign,
  Folder,
  Search,
  StickyNote,
  Target,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSearch } from "../hooks";
import type { SearchKind } from "../types";

const KIND_ICON: Record<SearchKind, typeof Search> = {
  HABIT: CheckSquare,
  NOTE: StickyNote,
  TRANSACTION: CircleDollarSign,
  GOAL: Target,
  CATEGORY: Folder,
};

interface GlobalSearchPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchPalette({
  open,
  onOpenChange,
}: GlobalSearchPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), 200);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebounced("");
    }
  }, [open]);

  const { data, isFetching } = useSearch(debounced);
  const results = data?.results ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="top"
        className="left-1/2 top-24 right-auto !w-full !max-w-xl -translate-x-1/2 rounded-lg p-0 sm:!max-w-xl"
      >
        <SheetHeader className="hidden">
          <SheetTitle>Search</SheetTitle>
        </SheetHeader>
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search habits, notes, transactions, goals…"
            className="h-7 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            esc
          </kbd>
        </div>
        <div className="max-h-[60vh] min-h-[8rem] overflow-y-auto scroll-thin border-t border-border p-1">
          {!debounced ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              Type to search.
            </p>
          ) : isFetching && results.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              Searching…
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              No results.
            </p>
          ) : (
            results.map((r) => {
              const Icon = KIND_ICON[r.kind];
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    router.push(r.href);
                    onOpenChange(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-muted"
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    {r.subtitle && (
                      <p className="truncate text-xs text-muted-foreground">
                        {r.subtitle}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                    {r.kind.toLowerCase()}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
