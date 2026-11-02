import * as z from 'zod';

export const addNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Note title is required')
    .max(150, 'Note title must be 150 characters or fewer'),
});

export type AddNoteSchema = z.infer<typeof addNoteSchema>;
