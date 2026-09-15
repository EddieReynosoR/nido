import * as z from 'zod';

export const addTopicSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Folder name is required')
    .max(50, 'Folder name must be 50 characters or fewer'),
});

export type AddTopicSchema = z.infer<typeof addTopicSchema>;
