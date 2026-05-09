import { z } from "zod";
import { SUPPORTED_CURRENCIES } from "@/features/finance/types";

export const accountTypeEnum = z.enum([
  "CASH",
  "BANK",
  "CREDIT",
  "INVESTMENT",
  "ASSET",
  "LIABILITY",
]);

export const createAccountSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  type: accountTypeEnum,
  currency: z.enum(SUPPORTED_CURRENCIES).optional(),
  balance: z
    .number({ message: "Balance is required" })
    .or(z.literal(0)),
});

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;
