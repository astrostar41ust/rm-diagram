import { z } from "zod";

const frequency = z.enum(["DAILY", "WEEKLY", "MONTHLY"]);

export const createHabitSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .default(""),
  frequency,
});

export type CreateHabitFormValues = z.infer<typeof createHabitSchema>;

export const updateHabitSchema = createHabitSchema.partial();

export type UpdateHabitFormValues = z.infer<typeof updateHabitSchema>;

export const createHabitLogSchema = z.object({
  habitId: z.number(),
  completedAt: z.string().min(1, "Date is required"),
  note: z.string().max(500, "Note must be at most 500 characters").optional(),
});

export type CreateHabitLogFormValues = z.infer<typeof createHabitLogSchema>;
