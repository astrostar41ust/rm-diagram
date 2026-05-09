"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotes, useDeleteNote } from "../hooks";
import type { NoteResponse } from "../types";
import { NoteCard } from "./NoteCard";
import { AddNoteSheet } from "./AddNoteSheet";
import { EditNoteSheet } from "./EditNoteSheet";

const PAGE_SIZE = 12;

export function NoteList() {
  const [page, setPage] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<NoteResponse | null>(null);

  const { data, isLoading, isError } = useNotes(page, PAGE_SIZE);
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

      {isLoading ? (
        <div className="flex justify-center py-12 text-muted-foreground">
          Loading…
        </div>
      ) : isError ? (
        <div className="flex justify-center py-12 text-destructive">
          Failed to load notes.
        </div>
      ) : notes.length === 0 ? (
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
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
