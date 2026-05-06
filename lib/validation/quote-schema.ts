import { z } from 'zod';

export const applianceSchema = z.object({
  name: z.string().min(1, 'Cihaz adı zorunludur').max(100),
  consumptionKwh: z.number().nonnegative().optional(),
  powerW: z.number().nonnegative().optional(),
  voltageV: z.number().nonnegative().optional(),
});

export type Appliance = z.infer<typeof applianceSchema>;

export const installationLocationSchema = z.enum(['roof', 'roof_flat', 'land', 'carport', 'facade']);
export type InstallationLocation = z.infer<typeof installationLocationSchema>;

export const quoteStepPersonalSchema = z.object({
  contactName: z.string().min(2, 'İsim soyisim girin').max(120),
  city: z.string().min(1, 'İl seçiniz'),
  district: z.string().max(120).optional().or(z.literal('')),
});

export const quoteStepLocationSchema = z.object({
  installationLocation: installationLocationSchema,
  locationNotes: z.string().max(1000).optional().or(z.literal('')),
});

export const quoteStepDescriptionSchema = z.object({
  description: z.string().max(2000).optional().or(z.literal('')),
});

export const quoteStepContactSchema = z.object({
  contactPhone: z.string().min(7, 'Geçerli bir telefon giriniz').max(30),
  contactEmail: z.email('Geçerli bir e-posta giriniz'),
  contactTimePreference: z.enum(['morning', 'afternoon', 'evening', 'any']),
  kvkkAccepted: z
    .boolean()
    .refine((v) => v === true, { message: 'KVKK metnini onaylamanız gerekir' }),
});

export const quoteFullSchema = quoteStepPersonalSchema
  .merge(quoteStepLocationSchema)
  .merge(quoteStepDescriptionSchema)
  .merge(quoteStepContactSchema)
  .extend({
    appliances: z.array(applianceSchema).max(40),
  });

export type QuoteFullInput = z.infer<typeof quoteFullSchema>;
