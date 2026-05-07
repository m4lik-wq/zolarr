import 'server-only';
import { getResendClient } from './client';

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const client = getResendClient();
  if (!client) {
    console.error('[email] sendEmail skipped: RESEND_API_KEY missing');
    return { ok: false, error: 'EMAIL_DISABLED' };
  }
  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
  try {
    const { data, error } = await client.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
    } as Parameters<typeof client.emails.send>[0]);
    if (error || !data?.id) {
      console.error('[email] Resend error', { error, to: input.to, subject: input.subject });
      return { ok: false, error: error?.message ?? 'unknown' };
    }
    return { ok: true, id: data.id };
  } catch (e) {
    console.error('[email] Resend threw', { error: e, to: input.to });
    return { ok: false, error: e instanceof Error ? e.message : 'unknown' };
  }
}
