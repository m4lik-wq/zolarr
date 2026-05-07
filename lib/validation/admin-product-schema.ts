import { z } from 'zod';

export const adminProductSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug zorunludur')
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Sadece küçük harf, rakam ve tire'),
  name: z.string().min(2, 'Ürün adı en az 2 karakter').max(200),
  shortDescription: z.string().max(300).optional().or(z.literal('')),
  description: z.string().max(8000).optional().or(z.literal('')),
  categoryId: z.string().uuid().nullable().optional(),
  brand: z.string().max(120).optional().or(z.literal('')),
  sku: z.string().max(60).optional().or(z.literal('')),
  price: z.number().nonnegative('Fiyat sıfır veya pozitif olmalı'),
  discountPrice: z.number().nonnegative().nullable().optional(),
  stock: z.number().int().nonnegative(),
  trackStock: z.boolean(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  images: z.array(z.string()).max(5),
  videos: z.array(z.string()).max(2),
  pdfs: z.array(z.string()).max(5),
  tags: z.array(z.string()).max(10),
  warrantyYears: z.number().int().nonnegative().nullable().optional(),
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;
