'use server';

import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { contactSchema } from '@/lib/validation/contact-schema';
import { generateContactNumber } from '@/lib/utils/contact-number';
import { sendEmail } from '@/lib/email/send';
import { contactAdminEmail, contactSenderEmail } from '@/lib/email/templates/contact';

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
      const adminEmail = process.env.ADMIN_EMAIL;
      const emailData = {
        messageNumber,
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        body: data.body,
      };
      await Promise.allSettled([
        adminEmail
          ? sendEmail({ to: adminEmail, replyTo: data.email, ...contactAdminEmail(emailData) })
          : Promise.resolve(),
        sendEmail({ to: data.email, ...contactSenderEmail(emailData) }),
      ]);
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
