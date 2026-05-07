import { renderEmail, escapeHtml } from '../template';

export interface WelcomeEmailData {
  name: string | null;
}

export interface RenderedEmail {
  subject: string;
  html: string;
}

export function welcomeEmail(d: WelcomeEmailData): RenderedEmail {
  const firstName = d.name?.split(' ')[0] ?? null;
  const greeting = firstName ? `Merhaba ${escapeHtml(firstName)}` : 'Hoş geldin';
  const subject = `Zolarr'a hoş geldiniz!`;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zolarr.com';
  const body = `
    <h2 style="margin:0 0 16px;font-size:22px;color:#fff;">${greeting},</h2>
    <p style="margin:0 0 16px;">Zolarr'a kayıt olduğunuz için teşekkürler. Güneş enerjisi yolculuğunuza birlikte başlıyoruz.</p>
    <p style="margin:0 0 16px;color:#bbb;">İlk olarak şunlardan başlayabilirsiniz:</p>
    <ul style="padding-left:20px;line-height:1.8;color:#ddd;">
      <li><a href="${site}/magaza" style="color:#5DD62C;">Mağazada</a> ürünlerimize göz atın</li>
      <li><a href="${site}/teklif/al" style="color:#5DD62C;">Teklif talebi oluşturun</a> — sistem boyutunuzu hesaplayalım</li>
      <li><a href="${site}/galeri" style="color:#5DD62C;">Tamamladığımız projelere</a> bakın</li>
    </ul>
    <div style="margin-top:24px;">
      <a href="${site}/hesap" style="display:inline-block;background:#5DD62C;color:#000;text-decoration:none;font-weight:600;padding:10px 20px;border-radius:12px;">Hesabım</a>
    </div>
  `;
  return { subject, html: renderEmail({ title: subject, body, preheader: `${greeting}, Zolarr'a hoş geldiniz.` }) };
}
