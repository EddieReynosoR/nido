import * as z from 'zod';

export const addSpaceSchema = z.object({
  name: z.string().trim().min(1, 'Space name is required'),
});

export type AddSpaceSchema = z.infer<typeof addSpaceSchema>;
