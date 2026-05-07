import { z } from 'zod';

export const supplierSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Sadece küçük harf, rakam ve tire'),
  name: z.string().min(2, 'En az 2 karakter').max(120),
  baseUrl: z.string().url('Geçerli bir URL girin').nullable().optional().or(z.literal('')),
  adapterSlug: z.string().min(1, 'Adapter seçin'),
  enabled: z.boolean(),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
