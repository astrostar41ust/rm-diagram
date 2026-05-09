"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotes } from "../hooks";
import { moodConfig, parseTags } from "../mood";
import type { NoteResponse } from "../types";
import { AddNoteSheet } from "./AddNoteSheet";
import { EditNoteSheet } from "./EditNoteSheet";

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 300;

function firstLine(text: string) {
  const trimmed = text.trim();
  const idx = trimmed.indexOf("\n");
  return idx === -1 ? trimmed : trimmed.slice(0, idx);
}

interface NoteRowProps {
  note: NoteResponse;
  onClick: (note: NoteResponse) => void;
}

function NoteRow({ note, onClick }: NoteRowProps) {
  const mood = note.mood ? moodConfig(note.mood) : null;
  const tags = parseTags(note.tags);
  const preview = firstLine(note.content);

  return (
    <button
      onClick={() => onClick(note)}
      className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/50"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{note.title}</p>
          {mood && (
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                mood.className,
              )}
            >
              <span>{mood.emoji}</span>
              {mood.label}
            </span>
          )}
        </div>
        {preview && (
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {preview}
          </p>
        )}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <p className="shrink-0 text-xs text-muted-foreground">
        {format(new Date(note.createdAt), "MMM d, yyyy")}
      </p>
    </button>
  );
}

export function NoteList() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<NoteResponse | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, isFetching } = useNotes(
    page,
    PAGE_SIZE,
    debouncedSearch,
  );

  const notes = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const isFirst = data?.first ?? true;
  const isLast = data?.last ?? true;
  const isSearching = debouncedSearch.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">
            Daily thoughts and reflections.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="size-4" data-icon="inline-start" />
          Add
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search notes by title or content…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-9 pr-9"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {isLoading ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-start gap-4 px-5 py-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <Skeleton className="h-3 w-16" />
            </li>
          ))}
        </ul>
      ) : isError ? (
        <div className="flex justify-center py-12 text-sm text-destructive">
          Failed to load notes.
        </div>
      ) : notes.length === 0 ? (
        isSearching ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-sm text-muted-foreground">
              No notes match &ldquo;{debouncedSearch}&rdquo;.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-sm text-muted-foreground">No notes yet.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="size-4" data-icon="inline-start" />
              Write your first note
            </Button>
          </div>
        )
      ) : (
        <>
          <ul
            className={cn(
              "divide-y divide-border overflow-hidden rounded-xl border border-border bg-card transition-opacity",
              isFetching && "opacity-60",
            )}
          >
            {notes.map((note) => (
              <li key={note.id}>
                <NoteRow note={note} onClick={setEditing} />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={isFirst}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="min-w-[5rem] text-center text-xs text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={isLast}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <AddNoteSheet open={addOpen} onOpenChange={setAddOpen} />
      <EditNoteSheet
        note={editing}
        onOpenChange={(open) => !open && setEditing(null)}
      />
    </div>
  );
}
