import { renderEmail, escapeHtml } from '../template';

export type QuoteStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost';

export interface QuoteStatusEmailData {
  quoteNumber: string;
  contactName: string;
  oldStatus: QuoteStatus;
  newStatus: QuoteStatus;
  adminNotes: string | null;
}

export interface RenderedEmail {
  subject: string;
  html: string;
}

const HEADLINE: Record<QuoteStatus, string> = {
  new: 'Teklif talebiniz alındı',
  contacted: 'Sizinle iletişime geçtik',
  quoted: 'Teklifiniz hazır',
  won: 'Teşekkürler — birlikte yola çıkıyoruz!',
  lost: 'Bu seferlik bir araya gelemedik',
};

const BODY: Record<QuoteStatus, (firstName: string, notes: string | null) => string> = {
  new: (n) => `<p>Merhaba ${n}, talebinizi aldık.</p>`,
  contacted: (n) =>
    `<p>Merhaba ${n}, ekibimiz size dönüş yaptı. Detayları konuşmak için müsait olduğunuzu bekliyoruz.</p>`,
  quoted: (n, notes) =>
    `<p>Merhaba ${n}, teklifimiz hazır.</p>${
      notes
        ? `<p style="background:#0a0a0a;border-left:3px solid #5DD62C;padding:12px 16px;border-radius:8px;color:#ddd;">${escapeHtml(notes)}</p>`
        : ''
    }`,
  won: (n) =>
    `<p>Merhaba ${n}, bizi tercih ettiğiniz için teşekkürler. Kurulum sürecinde sürekli iletişimde olacağız.</p>`,
  lost: (n, notes) =>
    `<p>Merhaba ${n}, bu sefer beraber çalışamadık ama her zaman değerlendirmek isteriz. İhtiyaç olursa bize tekrar ulaşabilirsiniz.</p>${
      notes ? `<p style="color:#888;font-size:13px;">Notumuz: ${escapeHtml(notes)}</p>` : ''
    }`,
};

export function quoteStatusEmail(d: QuoteStatusEmailData): RenderedEmail {
  const firstName = escapeHtml(d.contactName.split(' ')[0] ?? d.contactName);
  const subject = `${HEADLINE[d.newStatus]} · ${d.quoteNumber}`;
  const body = `
    <h2 style="margin:0 0 16px;font-size:20px;color:#fff;">${HEADLINE[d.newStatus]}</h2>
    ${BODY[d.newStatus](firstName, d.adminNotes)}
    <p style="margin:24px 0 0;color:#888;font-size:13px;"><strong>Teklif No:</strong> ${escapeHtml(d.quoteNumber)}</p>
  `;
  return { subject, html: renderEmail({ title: subject, body }) };
}
