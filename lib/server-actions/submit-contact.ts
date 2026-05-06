'use server';

import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { contactSchema } from '@/lib/validation/contact-schema';
import { generateContactNumber } from '@/lib/utils/contact-number';

export type SubmitContactResult =
  | { ok: true; messageNumber: string }
  | { ok: false; error: string };

export async function submitContact(input: unknown): Promise<SubmitContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Form verileri geçersiz, lütfen alanları kontrol edin.' };
  }
  const data = parsed.data;
  const supabase = await createClient();

  for (let attempt = 0; attempt < 3; attempt++) {
    const messageNumber = generateContactNumber();
    const { error } = await supabase.from('contact_messages').insert({
      message_number: messageNumber,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      body: data.body,
    });
    if (!error) {
      return { ok: true, messageNumber };
    }
    if ((error as { code?: string }).code === '23505') {
      continue;
    }
    return {
      ok: false,
      error: 'Mesajınız kaydedilemedi, lütfen kısa süre sonra tekrar deneyin.',
    };
  }

  return {
    ok: false,
    error: 'Mesajınız kaydedilemedi, lütfen kısa süre sonra tekrar deneyin.',
  };
}
