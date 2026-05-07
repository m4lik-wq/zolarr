export interface RenderEmailOptions {
  title: string;
  body: string; // HTML
  preheader?: string;
  unsubscribe?: { url: string; categoryLabel: string };
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zolarr.com';

export function renderEmail(opts: RenderEmailOptions): string {
  const { title, body, preheader } = opts;
  const prefsLink = opts.unsubscribe
    ? `<a href="${opts.unsubscribe.url}" style="color:#5DD62C;">${escapeHtml(opts.unsubscribe.categoryLabel)} e-postalarından çık</a>`
    : `<a href="${SITE_URL}/ayarlar" style="color:#5DD62C;">Tercihler</a>`;
  return `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#0a0a0a;color:#e7e7e7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div>` : ''}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#141414;border:1px solid #262626;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid #262626;">
                <a href="${SITE_URL}" style="color:#5DD62C;text-decoration:none;font-weight:700;font-size:20px;letter-spacing:0.5px;">Zolarr</a>
                <span style="color:#888;font-size:13px;margin-left:12px;">Güneş enerjisi çözümleri</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#e7e7e7;font-size:15px;line-height:1.6;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;border-top:1px solid #262626;color:#888;font-size:12px;line-height:1.5;">
                Bu e-posta Zolarr formuna girdiğiniz bilgilere göre size gönderildi.<br>
                ${prefsLink}
                &nbsp;·&nbsp;
                <a href="${SITE_URL}/kvkk" style="color:#5DD62C;">KVKK & Gizlilik</a>
                &nbsp;·&nbsp;
                <a href="${SITE_URL}/iletisim" style="color:#5DD62C;">İletişim</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
