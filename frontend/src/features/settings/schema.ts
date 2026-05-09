import { z } from "zod";

export const updateProfileSchema = z.object({
  firstname: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be at most 100 characters"),
  lastname: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be at most 100 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters"),
  email: z.email("Invalid email"),
});
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be at most 100 characters"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const updatePreferencesSchema = z.object({
  currency: z.enum(["THB", "USD", "EUR", "JPY"]),
  monthlyBudget: z
    .number({ message: "Monthly budget must be a number" })
    .min(0, "Monthly budget cannot be negative")
    .nullable()
    .optional(),
  theme: z.enum(["system", "light", "dark"]),
});
export type UpdatePreferencesFormValues = z.infer<typeof updatePreferencesSchema>;
