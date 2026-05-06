import { z } from 'zod';

export const dealerFullSchema = z.object({
  companyName: z.string().min(2).max(200),
  taxOffice: z.string().max(120).optional().or(z.literal('')),
  taxNumber: z.string().max(30).optional().or(z.literal('')),
  companyAddress: z.string().max(500).optional().or(z.literal('')),

  contactName: z.string().min(2).max(120),
  contactRole: z.string().max(120).optional().or(z.literal('')),
  contactPhone: z.string().min(7).max(30),
  contactEmail: z.email(),

  serviceCategories: z.array(z.string()).max(20),
  serviceAreas: z.array(z.string()).max(81),
  experienceYears: z.number().int().nonnegative().optional(),
  documentUrls: z.array(z.url()).max(20),

  kvkkAccepted: z
    .boolean()
    .refine((v) => v === true, { message: 'KVKK metnini onaylamanız gerekir' }),
});

export type DealerFullInput = z.infer<typeof dealerFullSchema>;
