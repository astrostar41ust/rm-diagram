import { z } from "zod";

const goalStatusEnum = z.enum(["ACTIVE", "COMPLETED"]);

export const createMilestoneSchema = z.object({
  title: z
    .string()
    .min(1, "Milestone title is required")
    .max(255, "Title must be at most 255 characters"),
});

export const createGoalSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be at most 255 characters"),
  description: z.string().optional(),
  targetDate: z.string().optional(),
  milestones: z.array(createMilestoneSchema).optional(),
});

export type CreateGoalFormValues = z.infer<typeof createGoalSchema>;

export const updateGoalSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be at most 255 characters")
    .optional(),
  description: z.string().optional(),
  targetDate: z.string().optional(),
  status: goalStatusEnum.optional(),
});

export type UpdateGoalFormValues = z.infer<typeof updateGoalSchema>;
