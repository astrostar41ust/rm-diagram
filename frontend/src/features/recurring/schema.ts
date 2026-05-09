import { z } from "zod";
import { SUPPORTED_CURRENCIES } from "@/features/finance/types";

const transactionTypeEnum = z.enum(["INCOME", "EXPENSE"]);
const frequencyEnum = z.enum(["DAILY", "WEEKLY", "MONTHLY"]);
const dayOfWeekEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

export const createRecurringSchema = z
  .object({
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
    frequency: frequencyEnum,
    dayOfMonth: z.number().int().min(1).max(31).optional(),
    dayOfWeek: dayOfWeekEnum.optional(),
    nextRunDate: z.string().min(1, "Next run date is required"),
    endDate: z.string().optional(),
  })
  .refine(
    (v) => v.frequency !== "MONTHLY" || v.dayOfMonth != null,
    { message: "Day of month is required", path: ["dayOfMonth"] },
  )
  .refine(
    (v) => v.frequency !== "WEEKLY" || v.dayOfWeek != null,
    { message: "Day of week is required", path: ["dayOfWeek"] },
  );

export type CreateRecurringFormValues = z.infer<typeof createRecurringSchema>;
