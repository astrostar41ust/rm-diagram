"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotes, useDeleteNote } from "../hooks";
import type { NoteResponse } from "../types";
import { NoteCard } from "./NoteCard";
import { AddNoteSheet } from "./AddNoteSheet";
import { EditNoteSheet } from "./EditNoteSheet";

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 300;

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
  const deleteNote = useDeleteNote();

  function handleDelete(note: NoteResponse) {
    const ok = window.confirm(`Delete note "${note.title}"?`);
    if (!ok) return;
    deleteNote.mutate(note.id);
  }

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
          New note
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
        <div className="flex justify-center py-12 text-muted-foreground">
          Loading…
        </div>
      ) : isError ? (
        <div className="flex justify-center py-12 text-destructive">
          Failed to load notes.
        </div>
      ) : notes.length === 0 ? (
        isSearching ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">
              No notes match &ldquo;{debouncedSearch}&rdquo;.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">No notes yet.</p>
            <Button
              variant="outline"
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
          <div
            className={
              isFetching
                ? "grid gap-4 opacity-60 transition-opacity sm:grid-cols-2 lg:grid-cols-3"
                : "grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={setEditing}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={isFirst}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="min-w-[5rem] text-center text-sm text-muted-foreground">
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
