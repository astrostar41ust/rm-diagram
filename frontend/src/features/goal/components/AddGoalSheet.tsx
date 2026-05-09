"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
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
import { createGoalSchema, type CreateGoalFormValues } from "../schema";
import { useCreateGoal } from "../hooks";

interface AddGoalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddGoalSheet({ open, onOpenChange }: AddGoalSheetProps) {
  const createGoal = useCreateGoal();

  const [milestones, setMilestones] = useState<string[]>([]);
  const [milestoneDraft, setMilestoneDraft] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateGoalFormValues>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: { title: "", description: "", targetDate: "" },
  });

  function resetAll() {
    reset({ title: "", description: "", targetDate: "" });
    setMilestones([]);
    setMilestoneDraft("");
  }

  function addMilestoneDraft() {
    const t = milestoneDraft.trim();
    if (!t) return;
    setMilestones((prev) => [...prev, t]);
    setMilestoneDraft("");
  }

  function removeMilestone(index: number) {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  }

  function onSubmit(data: CreateGoalFormValues) {
    createGoal.mutate(
      {
        title: data.title,
        description: data.description?.trim() || undefined,
        targetDate: data.targetDate?.trim() || undefined,
        milestones: milestones.map((title) => ({ title })),
      },
      {
        onSuccess: () => {
          resetAll();
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(val) => {
        if (!val) resetAll();
        onOpenChange(val);
      }}
    >
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>New goal</SheetTitle>
          <SheetDescription>
            Set a target and break it into milestones.
          </SheetDescription>
        </SheetHeader>

        <form
          id="add-goal-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-4"
        >
          <div className="space-y-2">
            <Label htmlFor="goal-title">Title</Label>
            <Input
              id="goal-title"
              placeholder="e.g. Run a marathon"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-description">Description</Label>
            <textarea
              id="goal-description"
              rows={4}
              placeholder="Why does this matter? What does success look like?"
              className="w-full min-w-0 resize-y rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-target-date">Target date</Label>
            <Input
              id="goal-target-date"
              type="date"
              {...register("targetDate")}
            />
          </div>

          <div className="space-y-2">
            <Label>Milestones</Label>
            {milestones.length > 0 && (
              <ul className="space-y-1.5">
                {milestones.map((title, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-sm"
                  >
                    <span className="flex-1">{title}</span>
                    <button
                      type="button"
                      onClick={() => removeMilestone(i)}
                      aria-label="Remove milestone"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <Input
                value={milestoneDraft}
                onChange={(e) => setMilestoneDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMilestoneDraft();
                  }
                }}
                placeholder="Add a milestone…"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addMilestoneDraft}
                disabled={!milestoneDraft.trim()}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        </form>

        <SheetFooter>
          <Button
            type="submit"
            form="add-goal-form"
            disabled={createGoal.isPending}
            className="w-full"
          >
            {createGoal.isPending ? "Saving…" : "Create goal"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
