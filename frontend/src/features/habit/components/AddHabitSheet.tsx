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
import { createHabitSchema, type CreateHabitFormValues } from "../schema";
import { useCreateHabit } from "../hooks";
import type { FrequencyType } from "../types";

const PRESET_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
];

const PRESET_ICONS = [
  "🏃", "📖", "🧘", "💪", "✍️", "🥗", "💧", "😴", "🎯", "🎨",
  "🎵", "📚", "🧹", "💊", "🌅",
];

const DAYS = [
  { label: "Mon", value: "MONDAY" },
  { label: "Tue", value: "TUESDAY" },
  { label: "Wed", value: "WEDNESDAY" },
  { label: "Thu", value: "THURSDAY" },
  { label: "Fri", value: "FRIDAY" },
  { label: "Sat", value: "SATURDAY" },
  { label: "Sun", value: "SUNDAY" },
];

interface AddHabitSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddHabitSheet({ open, onOpenChange }: AddHabitSheetProps) {
  const createHabit = useCreateHabit();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateHabitFormValues>({
    resolver: zodResolver(createHabitSchema),
    defaultValues: {
      name: "",
      frequencyType: "DAILY",
    },
  });

  const selectedColor = watch("color");
  const selectedIcon = watch("icon");
  const frequencyType = watch("frequencyType");
  const scheduleDays = watch("scheduleDays");
  const selectedDays = scheduleDays?.split(",").filter(Boolean) ?? [];

  function toggleDay(day: string) {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setValue("scheduleDays", next.join(","));
  }

  function onSubmit(data: CreateHabitFormValues) {
    createHabit.mutate(data, {
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
          <SheetTitle>New Habit</SheetTitle>
          <SheetDescription>
            Create a new habit to track daily.
          </SheetDescription>
        </SheetHeader>

        <form
          id="add-habit-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-4"
        >
          <div className="space-y-2">
            <Label htmlFor="habit-name">Name</Label>
            <Input
              id="habit-name"
              placeholder="e.g. Morning run"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() =>
                    setValue("icon", selectedIcon === icon ? undefined : icon)
                  }
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg border text-lg transition-colors",
                    selectedIcon === icon
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-foreground/30",
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    setValue("color", selectedColor === color ? undefined : color)
                  }
                  className={cn(
                    "size-8 rounded-full border-2 transition-transform",
                    selectedColor === color
                      ? "scale-110 border-foreground"
                      : "border-transparent",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <div className="flex gap-2">
              {(
                [
                  { label: "Daily", value: "DAILY" },
                  { label: "Specific days", value: "SPECIFIC_DAYS" },
                  { label: "Custom", value: "CUSTOM" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setValue("frequencyType", opt.value as FrequencyType);
                    if (opt.value !== "SPECIFIC_DAYS") {
                      setValue("scheduleDays", undefined);
                    }
                  }}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    frequencyType === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {frequencyType === "SPECIFIC_DAYS" && (
            <div className="space-y-2">
              <Label>Schedule days</Label>
              <div className="flex gap-1.5">
                {DAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full text-xs font-medium transition-colors",
                      selectedDays.includes(day.value)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>

        <SheetFooter>
          <Button
            type="submit"
            form="add-habit-form"
            disabled={createHabit.isPending}
            className="w-full"
          >
            {createHabit.isPending ? "Creating…" : "Create habit"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
