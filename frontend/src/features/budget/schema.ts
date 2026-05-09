import { z } from "zod";

export const createBudgetSchema = z.object({
  categoryId: z
    .number({ message: "Category is required" })
    .int()
    .positive("Category is required"),
  monthlyLimit: z
    .number({ message: "Limit is required" })
    .nonnegative("Limit must be ≥ 0"),
  alertThreshold: z
    .number()
    .int()
    .min(1, "Threshold must be at least 1")
    .max(100, "Threshold must be at most 100")
    .optional(),
});

export type CreateBudgetFormValues = z.infer<typeof createBudgetSchema>;

export const updateBudgetSchema = createBudgetSchema.partial();
export type UpdateBudgetFormValues = z.infer<typeof updateBudgetSchema>;
