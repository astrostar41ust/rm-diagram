import { z } from "zod";

export const createNoteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  content: z.string().min(1, "Content is required"),
  date: z.string().min(1, "Date is required"),
});

export type CreateNoteFormValues = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters")
    .optional(),
  content: z.string().min(1, "Content is required").optional(),
});

export type UpdateNoteFormValues = z.infer<typeof updateNoteSchema>;
