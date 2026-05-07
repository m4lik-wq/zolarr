import { z } from 'zod';

export const campaignSchema = z.object({
  title: z.string().min(2, 'Baslik en az 2 karakter olmali').max(200),
  subtitle: z.string().max(500).optional().or(z.literal('')),
  ctaLabel: z.string().max(50).optional().or(z.literal('')),
  ctaHref: z
    .string()
    .url()
    .or(z.string().regex(/^\/.+/, 'URL veya / ile baslayan path olmali'))
    .optional()
    .or(z.literal('')),
  bgImageUrl: z.string().url('Gecerli bir URL girin').optional().or(z.literal('')),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
});

export type CampaignInput = z.infer<typeof campaignSchema>;
