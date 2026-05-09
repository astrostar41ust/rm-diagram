import { z } from "zod";

export const frequencyType = z.enum(["DAILY", "SPECIFIC_DAYS", "CUSTOM"]);

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createHabitSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  icon: z.string().optional(),
  color: z.string().optional(),
  frequencyType,
  scheduleDays: z.string().optional(),
  reminderEnabled: z.boolean().optional(),
  reminderTime: z
    .string()
    .regex(timeRegex, "Use HH:MM format")
    .optional()
    .or(z.literal("")),
});

export type CreateHabitFormValues = z.infer<typeof createHabitSchema>;
