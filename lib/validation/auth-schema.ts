import { z } from 'zod';

const passwordRule = z
  .string()
  .min(8, 'Şifre en az 8 karakter olmalı')
  .max(72, 'Şifre 72 karakteri aşamaz');

export const loginSchema = z.object({
  email: z.email('Geçerli bir e-posta giriniz'),
  password: z.string().min(1, 'Şifre gerekli'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Adınızı girin').max(120),
    email: z.email('Geçerli bir e-posta giriniz'),
    password: passwordRule,
    passwordConfirm: z.string(),
    kvkkAccepted: z
      .boolean()
      .refine((v) => v === true, { message: 'KVKK metnini onaylamanız gerekir' }),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: 'Şifreler eşleşmiyor',
    path: ['passwordConfirm'],
  });

export const resetRequestSchema = z.object({
  email: z.email('Geçerli bir e-posta giriniz'),
});

export const resetSchema = z
  .object({
    password: passwordRule,
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: 'Şifreler eşleşmiyor',
    path: ['passwordConfirm'],
  });

export const profileEditSchema = z.object({
  name: z.string().min(2, 'Adınızı girin').max(120),
  phone: z.string().max(30).optional().or(z.literal('')),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetRequestInput = z.infer<typeof resetRequestSchema>;
export type ResetInput = z.infer<typeof resetSchema>;
export type ProfileEditInput = z.infer<typeof profileEditSchema>;
