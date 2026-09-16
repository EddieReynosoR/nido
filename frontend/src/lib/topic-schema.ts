import * as z from 'zod';

export const HEX_COLOR_REGEX = /^[0-9A-Fa-f]{6}$/;

export const DEFAULT_TOPIC_COLOR = '6B7280';

export const addTopicSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Folder name is required')
    .max(50, 'Folder name must be 50 characters or fewer'),
  color: z
    .string()
    .regex(HEX_COLOR_REGEX, 'Color must be a 6-digit hex value (e.g. 3B82F6)'),
});

export type AddTopicSchema = z.infer<typeof addTopicSchema>;
