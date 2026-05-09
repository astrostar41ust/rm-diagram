import { z } from "zod";

const moodEnum = z.enum(["GREAT", "GOOD", "OKAY", "BAD"]);

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const createNoteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  content: z.string().min(1, "Content is required"),
  mood: moodEnum.optional(),
  tags: z.string().max(200, "Tags must be at most 200 characters").optional(),
  noteDate: dateString.optional(),
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
  noteDate: dateString.optional(),
});

export type UpdateNoteFormValues = z.infer<typeof updateNoteSchema>;
