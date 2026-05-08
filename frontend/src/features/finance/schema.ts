import { z } from "zod";

const transactionType = z.enum(["INCOME", "EXPENSE"]);

export const createTransactionSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
  type: transactionType,
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category must be at most 100 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .default(""),
  date: z.string().min(1, "Date is required"),
});

export type CreateTransactionFormValues = z.infer<
  typeof createTransactionSchema
>;

export const updateTransactionSchema = createTransactionSchema.partial();

export type UpdateTransactionFormValues = z.infer<
  typeof updateTransactionSchema
>;
