import { renderEmail, escapeHtml } from '../template';

export interface DealerEmailData {
  applicationNumber: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  serviceCategories: string[];
  serviceAreas: string[];
  experienceYears?: number | null;
}

export interface RenderedEmail {
  subject: string;
  html: string;
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export function dealerAdminEmail(d: DealerEmailData): RenderedEmail {
  const subject = `Yeni Bayi Başvurusu · ${d.applicationNumber}`;
  const body = `
    <h2 style="margin:0 0 16px;font-size:20px;color:#fff;">Yeni bayi başvurusu</h2>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:#888;width:140px;">Başvuru No</td><td style="padding:8px 0;color:#5DD62C;font-family:monospace;">${escapeHtml(d.applicationNumber)}</td></tr>
      <tr><td style="padding:8px 0;color:#888;">Firma</td><td style="padding:8px 0;">${escapeHtml(d.companyName)}</td></tr>
      <tr><td style="padding:8px 0;color:#888;">Yetkili</td><td style="padding:8px 0;">${escapeHtml(d.contactName)}</td></tr>
      <tr><td style="padding:8px 0;color:#888;">E-posta</td><td style="padding:8px 0;"><a href="mailto:${encodeURIComponent(d.contactEmail)}" style="color:#5DD62C;">${escapeHtml(d.contactEmail)}</a></td></tr>
      <tr><td style="padding:8px 0;color:#888;">Telefon</td><td style="padding:8px 0;"><a href="tel:${encodeURIComponent(d.contactPhone)}" style="color:#5DD62C;">${escapeHtml(d.contactPhone)}</a></td></tr>
      <tr><td style="padding:8px 0;color:#888;">Hizmetler</td><td style="padding:8px 0;">${escapeHtml(d.serviceCategories.join(', '))}</td></tr>
      <tr><td style="padding:8px 0;color:#888;">Bölgeler</td><td style="padding:8px 0;">${escapeHtml(d.serviceAreas.join(', '))}</td></tr>
      ${d.experienceYears ? `<tr><td style="padding:8px 0;color:#888;">Tecrübe</td><td style="padding:8px 0;">${d.experienceYears} yıl</td></tr>` : ''}
    </table>
    <div style="margin-top:24px;">
      <a href="${SITE}/admin/bayiler" style="display:inline-block;background:#5DD62C;color:#000;text-decoration:none;font-weight:600;padding:10px 20px;border-radius:12px;">Admin panelinde aç</a>
    </div>
  `;
  return { subject, html: renderEmail({ title: subject, body, preheader: `${d.companyName} bayi başvurusu yaptı.` }) };
}

export function dealerApplicantEmail(d: DealerEmailData): RenderedEmail {
  const firstName = d.contactName.split(' ')[0] ?? d.contactName;
  const subject = `Bayi başvurunuz alındı · ${d.applicationNumber}`;
  const body = `
    <h2 style="margin:0 0 16px;font-size:20px;color:#fff;">Merhaba ${escapeHtml(firstName)},</h2>
    <p style="margin:0 0 16px;"><strong>${escapeHtml(d.companyName)}</strong> firması adına yaptığınız bayi başvurusunu aldık. Ekibimiz başvurunuzu değerlendirip 3 iş günü içinde size dönüş yapacak.</p>
    <p style="margin:0 0 16px;"><strong>Başvuru No:</strong> <span style="color:#5DD62C;font-family:monospace;">${escapeHtml(d.applicationNumber)}</span></p>
    <p style="margin:0 0 16px;color:#bbb;">İlginiz için teşekkürler.</p>
  `;
  return { subject, html: renderEmail({ title: subject, body, preheader: `Başvuru No: ${d.applicationNumber}` }) };
}
