import { z } from "zod";
import { SUPPORTED_CURRENCIES } from "./types";

const transactionTypeEnum = z.enum(["INCOME", "EXPENSE"]);

export const createTransactionSchema = z.object({
  type: transactionTypeEnum,
  categoryId: z
    .number({ message: "Category is required" })
    .int()
    .positive("Category is required"),
  amount: z
    .number({ message: "Amount is required" })
    .positive("Amount must be greater than 0"),
  currency: z.enum(SUPPORTED_CURRENCIES).optional(),
  note: z.string().max(500, "Note must be at most 500 characters").optional(),
  transactionDate: z.string().min(1, "Date is required"),
});

export type CreateTransactionFormValues = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = createTransactionSchema.partial();
export type UpdateTransactionFormValues = z.infer<typeof updateTransactionSchema>;
