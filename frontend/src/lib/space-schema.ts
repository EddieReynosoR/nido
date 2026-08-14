import * as z from 'zod';

export const addSpaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Space name is required')
    .max(50, 'Space name must be 50 characters or less'),
});

export type AddSpaceSchema = z.infer<typeof addSpaceSchema>;
