import { z } from 'zod';

export const adminFaqSchema = z.object({
  question: z.string().min(3, 'Soru en az 3 karakter').max(500),
  answer: z.string().min(3, 'Cevap en az 3 karakter').max(8000),
  category: z.enum(['genel', 'teknik', 'fiyat', 'kurulum', 'garanti']),
  sortOrder: z.number().int().nonnegative(),
  isPublished: z.boolean(),
});

export type AdminFaqInput = z.infer<typeof adminFaqSchema>;
