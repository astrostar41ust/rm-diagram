import { z } from "zod";

export const createGoalSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .default(""),
  targetDate: z.string().min(1, "Target date is required"),
});

export type CreateGoalFormValues = z.infer<typeof createGoalSchema>;

export const updateGoalSchema = createGoalSchema
  .partial()
  .extend({
    status: z
      .enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ABANDONED"])
      .optional(),
  });

export type UpdateGoalFormValues = z.infer<typeof updateGoalSchema>;
