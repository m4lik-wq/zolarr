import { z } from 'zod';

export const adminProjectSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug zorunlu')
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Sadece küçük harf, rakam ve tire'),
  title: z.string().min(2, 'Başlık en az 2 karakter').max(200),
  type: z.enum(['konut', 'ticari', 'tarim']),
  location: z.string().min(1).max(200),
  capacityKwp: z.number().nonnegative(),
  coverImage: z.string().min(1, 'Kapak görseli zorunlu'),
  description: z.string().max(8000).optional().or(z.literal('')),
  beforeImage: z.string().nullable().optional(),
  afterImage: z.string().nullable().optional(),
  galleryImages: z.array(z.string()).max(20),
  productSlugs: z.array(z.string()).max(20),
  customerQuote: z.string().max(1000).optional().or(z.literal('')),
  customerName: z.string().max(200).optional().or(z.literal('')),
  annualSavingsTry: z.number().nonnegative().nullable().optional(),
  completionDate: z.string().nullable().optional(),
  isPublished: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
});

export type AdminProjectInput = z.infer<typeof adminProjectSchema>;
