import { renderEmail, escapeHtml } from '../template';

export interface ContactEmailData {
  messageNumber: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  body: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export function contactAdminEmail(d: ContactEmailData): RenderedEmail {
  const emailSubject = `Yeni İletişim Mesajı · ${d.messageNumber}`;
  const body = `
    <h2 style="margin:0 0 16px;font-size:20px;color:#fff;">Yeni iletişim mesajı</h2>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:#888;width:140px;">Mesaj No</td><td style="padding:8px 0;color:#5DD62C;font-family:monospace;">${escapeHtml(d.messageNumber)}</td></tr>
      <tr><td style="padding:8px 0;color:#888;">Gönderen</td><td style="padding:8px 0;">${escapeHtml(d.name)}</td></tr>
      <tr><td style="padding:8px 0;color:#888;">E-posta</td><td style="padding:8px 0;"><a href="mailto:${encodeURIComponent(d.email)}" style="color:#5DD62C;">${escapeHtml(d.email)}</a></td></tr>
      ${d.phone ? `<tr><td style="padding:8px 0;color:#888;">Telefon</td><td style="padding:8px 0;"><a href="tel:${encodeURIComponent(d.phone)}" style="color:#5DD62C;">${escapeHtml(d.phone)}</a></td></tr>` : ''}
      ${d.subject ? `<tr><td style="padding:8px 0;color:#888;">Konu</td><td style="padding:8px 0;">${escapeHtml(d.subject)}</td></tr>` : ''}
    </table>
    <h3 style="margin:24px 0 8px;font-size:16px;color:#fff;">Mesaj</h3>
    <div style="white-space:pre-wrap;background:#0a0a0a;border:1px solid #262626;border-radius:12px;padding:16px;color:#bbb;">${escapeHtml(d.body)}</div>
    <div style="margin-top:24px;">
      <a href="${SITE}/admin/iletisim" style="display:inline-block;background:#5DD62C;color:#000;text-decoration:none;font-weight:600;padding:10px 20px;border-radius:12px;">Admin panelinde aç</a>
    </div>
  `;
  return { subject: emailSubject, html: renderEmail({ title: emailSubject, body, preheader: `${d.name}: ${d.subject || d.body.slice(0, 60)}` }) };
}

export function contactSenderEmail(d: ContactEmailData): RenderedEmail {
  const firstName = d.name.split(' ')[0] ?? d.name;
  const emailSubject = `Mesajınız alındı · ${d.messageNumber}`;
  const body = `
    <h2 style="margin:0 0 16px;font-size:20px;color:#fff;">Merhaba ${escapeHtml(firstName)},</h2>
    <p style="margin:0 0 16px;">Mesajınızı aldık. En kısa sürede ekibimiz size dönüş yapacak.</p>
    <p style="margin:0 0 16px;"><strong>Mesaj No:</strong> <span style="color:#5DD62C;font-family:monospace;">${escapeHtml(d.messageNumber)}</span></p>
    <p style="margin:0;color:#bbb;">İlginiz için teşekkürler.</p>
  `;
  return { subject: emailSubject, html: renderEmail({ title: emailSubject, body, preheader: `Mesaj No: ${d.messageNumber}` }) };
}
