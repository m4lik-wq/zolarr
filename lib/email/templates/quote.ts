import { renderEmail, escapeHtml } from '../template';

export interface QuoteEmailData {
  quoteNumber: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  district?: string | null;
  installationLocation: string;
  estimatedKwp?: number | null;
}

export interface RenderedEmail {
  subject: string;
  html: string;
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export function quoteAdminEmail(d: QuoteEmailData): RenderedEmail {
  const subject = `Yeni Teklif Talebi · ${d.quoteNumber}`;
  const body = `
    <h2 style="margin:0 0 16px;font-size:20px;color:#fff;">Yeni teklif talebi</h2>
    <p style="margin:0 0 16px;color:#bbb;">Sitenize yeni bir teklif talebi geldi.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:#888;width:140px;">Teklif No</td><td style="padding:8px 0;color:#5DD62C;font-family:monospace;">${escapeHtml(d.quoteNumber)}</td></tr>
      <tr><td style="padding:8px 0;color:#888;">İsim</td><td style="padding:8px 0;">${escapeHtml(d.contactName)}</td></tr>
      <tr><td style="padding:8px 0;color:#888;">E-posta</td><td style="padding:8px 0;"><a href="mailto:${encodeURIComponent(d.contactEmail)}" style="color:#5DD62C;">${escapeHtml(d.contactEmail)}</a></td></tr>
      <tr><td style="padding:8px 0;color:#888;">Telefon</td><td style="padding:8px 0;"><a href="tel:${encodeURIComponent(d.contactPhone)}" style="color:#5DD62C;">${escapeHtml(d.contactPhone)}</a></td></tr>
      <tr><td style="padding:8px 0;color:#888;">Şehir</td><td style="padding:8px 0;">${escapeHtml(d.city)}${d.district ? ' / ' + escapeHtml(d.district) : ''}</td></tr>
      <tr><td style="padding:8px 0;color:#888;">Kurulum yeri</td><td style="padding:8px 0;">${escapeHtml(d.installationLocation)}</td></tr>
      ${d.estimatedKwp ? `<tr><td style="padding:8px 0;color:#888;">Tahmini sistem</td><td style="padding:8px 0;">${d.estimatedKwp.toFixed(2)} kWp</td></tr>` : ''}
    </table>
    <div style="margin-top:24px;">
      <a href="${SITE}/admin/teklifler" style="display:inline-block;background:#5DD62C;color:#000;text-decoration:none;font-weight:600;padding:10px 20px;border-radius:12px;">Admin panelinde aç</a>
    </div>
  `;
  return { subject, html: renderEmail({ title: subject, body, preheader: `${d.contactName} (${d.city}) yeni bir teklif talebi gönderdi.` }) };
}

export function quoteCustomerEmail(d: QuoteEmailData): RenderedEmail {
  const firstName = d.contactName.split(' ')[0] ?? d.contactName;
  const subject = `Teklif talebiniz alındı · ${d.quoteNumber}`;
  const body = `
    <h2 style="margin:0 0 16px;font-size:20px;color:#fff;">Merhaba ${escapeHtml(firstName)},</h2>
    <p style="margin:0 0 16px;">Teklif talebinizi aldık. En kısa sürede ekibimiz sizinle iletişime geçecek.</p>
    <p style="margin:0 0 16px;">
      <strong>Teklif No:</strong> <span style="color:#5DD62C;font-family:monospace;">${escapeHtml(d.quoteNumber)}</span>
    </p>
    <p style="margin:0 0 16px;color:#bbb;">Ortalama dönüş süresi 1 iş günüdür. Acil bir sorunuz olursa <a href="${SITE}/iletisim" style="color:#5DD62C;">iletişim sayfasından</a> bize ulaşabilirsiniz.</p>
    <hr style="border:none;border-top:1px solid #262626;margin:24px 0;">
    <p style="margin:0;color:#888;font-size:13px;">Bu e-posta size sadece teklif talebinizin alındığını bildirmek için gönderildi. Cevap gelmesini beklemeyin — ekibimiz telefonla veya e-posta ile sizi arayacak.</p>
  `;
  return { subject, html: renderEmail({ title: subject, body, preheader: `Teklif No: ${d.quoteNumber}` }) };
}
