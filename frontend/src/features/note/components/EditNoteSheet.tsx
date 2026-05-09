"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { updateNoteSchema, type UpdateNoteFormValues } from "../schema";
import { useUpdateNote, useDeleteNote } from "../hooks";
import { MOOD_OPTIONS } from "../mood";
import type { Mood, NoteResponse, UpdateNoteRequest } from "../types";

interface EditNoteSheetProps {
  note: NoteResponse | null;
  onOpenChange: (open: boolean) => void;
}

export function EditNoteSheet({ note, onOpenChange }: EditNoteSheetProps) {
  const updateNote = useUpdateNote(note?.id ?? 0);
  const deleteNote = useDeleteNote();

  function handleDelete() {
    if (!note) return;
    const ok = window.confirm(`Delete note "${note.title}"?`);
    if (!ok) return;
    deleteNote.mutate(note.id, {
      onSuccess: () => onOpenChange(false),
    });
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateNoteFormValues>({
    resolver: zodResolver(updateNoteSchema),
    defaultValues: {
      title: note?.title ?? "",
      content: note?.content ?? "",
      mood: note?.mood ?? undefined,
      tags: note?.tags ?? "",
    },
  });

  useEffect(() => {
    if (note) {
      reset({
        title: note.title,
        content: note.content,
        mood: note.mood ?? undefined,
        tags: note.tags ?? "",
      });
    }
  }, [note, reset]);

  const selectedMood = watch("mood");

  function onSubmit(data: UpdateNoteFormValues) {
    if (!note) return;
    const payload: UpdateNoteRequest = {
      title: data.title,
      content: data.content,
      mood: data.mood,
      tags: data.tags?.trim() ?? "",
    };
    updateNote.mutate(payload, {
      onSuccess: () => onOpenChange(false),
    });
  }

  return (
    <Sheet open={!!note} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Edit note</SheetTitle>
          <SheetDescription>Update your thoughts.</SheetDescription>
        </SheetHeader>

        <form
          id="edit-note-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-4"
        >
          <div className="space-y-2">
            <Label htmlFor="edit-note-title">Title</Label>
            <Input id="edit-note-title" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-note-content">Content</Label>
            <textarea
              id="edit-note-content"
              rows={8}
              className="w-full min-w-0 resize-y rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              {...register("content")}
            />
            {errors.content && (
              <p className="text-xs text-destructive">
                {errors.content.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Mood</Label>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setValue(
                      "mood",
                      selectedMood === opt.value
                        ? undefined
                        : (opt.value as Mood),
                    )
                  }
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    selectedMood === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span>{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-note-tags">Tags</Label>
            <Input
              id="edit-note-tags"
              placeholder="comma,separated,tags"
              {...register("tags")}
            />
            {errors.tags && (
              <p className="text-xs text-destructive">{errors.tags.message}</p>
            )}
          </div>
        </form>

        <SheetFooter className="flex-row gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleDelete}
            disabled={deleteNote.isPending}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-4" data-icon="inline-start" />
            {deleteNote.isPending ? "Deleting…" : "Delete"}
          </Button>
          <Button
            type="submit"
            form="edit-note-form"
            disabled={updateNote.isPending}
            className="flex-1"
          >
            {updateNote.isPending ? "Saving…" : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
