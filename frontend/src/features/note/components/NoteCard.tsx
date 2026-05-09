"use client";

import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { moodConfig, parseTags } from "../mood";
import type { NoteResponse } from "../types";

interface NoteCardProps {
  note: NoteResponse;
  onEdit: (note: NoteResponse) => void;
  onDelete: (note: NoteResponse) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const mood = note.mood ? moodConfig(note.mood) : null;
  const tags = parseTags(note.tags);

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {format(new Date(note.createdAt), "MMM d, yyyy")}
        </p>
        {mood && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              mood.className,
            )}
          >
            <span>{mood.emoji}</span>
            {mood.label}
          </span>
        )}
      </div>

      <p className="mt-1 line-clamp-1 font-medium">{note.title}</p>
      <p className="mt-2 line-clamp-4 flex-1 text-sm whitespace-pre-wrap text-muted-foreground">
        {note.content}
      </p>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
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

      <div className="mt-4 flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(note)}
          aria-label="Edit note"
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(note)}
          aria-label="Delete note"
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
