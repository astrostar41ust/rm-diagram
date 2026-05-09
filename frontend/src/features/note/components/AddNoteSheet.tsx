"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { createNoteSchema, type CreateNoteFormValues } from "../schema";
import { useCreateNote } from "../hooks";
import { MOOD_OPTIONS } from "../mood";
import type { Mood } from "../types";

interface AddNoteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddNoteSheet({ open, onOpenChange }: AddNoteSheetProps) {
  const createNote = useCreateNote();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateNoteFormValues>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: { title: "", content: "" },
  });

  const selectedMood = watch("mood");

  function onSubmit(data: CreateNoteFormValues) {
    const payload: CreateNoteFormValues = {
      ...data,
      tags: data.tags?.trim() || undefined,
    };
    createNote.mutate(payload, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(val) => {
        if (!val) reset();
        onOpenChange(val);
      }}
    >
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>New note</SheetTitle>
          <SheetDescription>Capture a thought or reflection.</SheetDescription>
        </SheetHeader>

        <form
          id="add-note-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-4"
        >
          <div className="space-y-2">
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              placeholder="e.g. Morning reflection"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note-content">Content</Label>
            <textarea
              id="note-content"
              rows={8}
              placeholder="What's on your mind?"
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
            <Label htmlFor="note-tags">Tags</Label>
            <Input
              id="note-tags"
              placeholder="comma,separated,tags"
              {...register("tags")}
            />
            {errors.tags && (
              <p className="text-xs text-destructive">{errors.tags.message}</p>
            )}
          </div>
        </form>

        <SheetFooter>
          <Button
            type="submit"
            form="add-note-form"
            disabled={createNote.isPending}
            className="w-full"
          >
            {createNote.isPending ? "Saving…" : "Save note"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
