import { z } from "zod";

export const generatePromptSchema = z.object({
  prompt: z
    .string()
    .min(1, "Enter a prompt")
    .max(4000, "Prompt must be at most 4000 characters"),
});

export type GeneratePromptFormValues = z.infer<typeof generatePromptSchema>;
