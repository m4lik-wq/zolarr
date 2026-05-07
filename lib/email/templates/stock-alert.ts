import { renderEmail, escapeHtml } from '../template';

export interface StockAlertEmailData {
  productName: string;
  productSlug: string;
  userName: string | null;
}

export interface RenderedEmail {
  subject: string;
  html: string;
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zolarr.com';

export function stockAlertEmail(d: StockAlertEmailData): RenderedEmail {
  const firstName = d.userName?.split(' ')[0] ?? null;
  const greeting = firstName ? `Merhaba ${escapeHtml(firstName)}` : 'Merhaba';
  const subject = `${d.productName} stoğa girdi`;
  const body = `
    <h2 style="margin:0 0 16px;color:#fff;">${greeting},</h2>
    <p>Beklediğiniz ürün <strong>${escapeHtml(d.productName)}</strong> tekrar stoğa girdi.</p>
    <div style="margin-top:24px;">
      <a href="${SITE}/magaza/${escapeHtml(d.productSlug)}" style="display:inline-block;background:#5DD62C;color:#000;text-decoration:none;font-weight:600;padding:10px 20px;border-radius:12px;">Ürünü gör</a>
    </div>
    <p style="margin-top:24px;color:#888;font-size:13px;">Stok sınırlı olabilir; mümkünse hemen sipariş verin.</p>
  `;
  return { subject, html: renderEmail({ title: subject, body }) };
}
