import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Adınızı girin').max(120),
  email: z.email('Geçerli bir e-posta giriniz'),
  phone: z.string().max(30).optional().or(z.literal('')),
  subject: z.string().max(200).optional().or(z.literal('')),
  body: z.string().min(10, 'Mesaj en az 10 karakter olmalı').max(4000),
  kvkkAccepted: z
    .boolean()
    .refine((v) => v === true, { message: 'KVKK metnini onaylamanız gerekir' }),
});

export type ContactInput = z.infer<typeof contactSchema>;
