import { z } from "zod";

export const frequencyType = z.enum(["DAILY", "SPECIFIC_DAYS", "CUSTOM"]);

export const createHabitSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  icon: z.string().optional(),
  color: z.string().optional(),
  frequencyType,
  scheduleDays: z.string().optional(),
});

export type CreateHabitFormValues = z.infer<typeof createHabitSchema>;
