'use server';

import 'server-only';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  loginSchema,
  registerSchema,
  resetRequestSchema,
  resetSchema,
  profileEditSchema,
} from '@/lib/validation/auth-schema';
import { sendEmail } from '@/lib/email/send';
import { welcomeEmail } from '@/lib/email/templates/welcome';

export type ActionResult = { ok: true } | { ok: false; error: string };

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

export async function signInAction(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Form geçersiz' };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { ok: false, error: 'E-posta veya şifre hatalı.' };
  }
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function signUpAction(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Form geçersiz' };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback?next=/hesap`,
      data: { name: parsed.data.name },
    },
  });
  if (error) {
    if (error.message.toLowerCase().includes('already')) {
      return { ok: false, error: 'Bu e-posta zaten kayıtlı.' };
    }
    return { ok: false, error: 'Kayıt sırasında bir hata oluştu.' };
  }
  // Best-effort welcome email (Supabase confirmation email goes separately)
  await Promise.allSettled([
    sendEmail({
      to: parsed.data.email,
      ...welcomeEmail({ name: parsed.data.name }),
    }),
  ]);
  return { ok: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function requestPasswordResetAction(input: unknown): Promise<ActionResult> {
  const parsed = resetRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Geçerli bir e-posta giriniz.' };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/sifre-yenile`,
  });
  if (error) {
    return { ok: false, error: 'İstek gönderilemedi, lütfen tekrar deneyin.' };
  }
  return { ok: true };
}

export async function updatePasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Form geçersiz' };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { ok: false, error: 'Şifre güncellenemedi.' };
  }
  return { ok: true };
}

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const parsed = profileEditSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Form geçersiz' };
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Oturum gerekli.' };
  const { error } = await supabase
    .from('profiles')
    .update({ name: parsed.data.name, phone: parsed.data.phone || null })
    .eq('id', user.id);
  if (error) {
    return { ok: false, error: 'Profil kaydedilemedi.' };
  }
  revalidatePath('/hesap');
  revalidatePath('/hesap/profil');
  return { ok: true };
}
