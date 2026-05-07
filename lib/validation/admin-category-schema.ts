import { z } from 'zod';

export const adminCategorySchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Sadece küçük harf, rakam ve tire'),
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional().or(z.literal('')),
  parentId: z.string().uuid().nullable().optional(),
  icon: z.string().max(50).optional().or(z.literal('')),
  sortOrder: z.number().int().nonnegative(),
});

export type AdminCategoryInput = z.infer<typeof adminCategorySchema>;
