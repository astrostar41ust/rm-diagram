import { z } from "zod";

const moodEnum = z.enum(["GREAT", "GOOD", "OKAY", "BAD"]);

export const createNoteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  content: z.string().min(1, "Content is required"),
  mood: moodEnum.optional(),
  tags: z.string().max(200, "Tags must be at most 200 characters").optional(),
});

export type CreateNoteFormValues = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters")
    .optional(),
  content: z.string().min(1, "Content is required").optional(),
  mood: moodEnum.optional(),
  tags: z.string().max(200, "Tags must be at most 200 characters").optional(),
});

export type UpdateNoteFormValues = z.infer<typeof updateNoteSchema>;
