import { renderEmail, escapeHtml } from '../template';

export interface SupplierSummaryRow {
  name: string;
  total: number;
  updated: number;
  alerts: number;
  errors: number;
}

export interface SupplierSyncSummaryData {
  runAt: string;
  suppliers: SupplierSummaryRow[];
  totalAlerts: number;
  totalErrors: number;
}

export interface RenderedEmail {
  subject: string;
  html: string;
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export function supplierSyncSummaryEmail(d: SupplierSyncSummaryData): RenderedEmail {
  const subject = `Tedarikçi Sync Özeti · ${d.totalAlerts} uyarı${d.totalErrors > 0 ? `, ${d.totalErrors} hata` : ''}`;
  const rows = d.suppliers
    .map(
      (s) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #262626;">${escapeHtml(s.name)}</td>
      <td style="padding:8px;border-bottom:1px solid #262626;text-align:right;">${s.updated}/${s.total}</td>
      <td style="padding:8px;border-bottom:1px solid #262626;text-align:right;color:${s.alerts > 0 ? '#5DD62C' : '#888'};">${s.alerts}</td>
      <td style="padding:8px;border-bottom:1px solid #262626;text-align:right;color:${s.errors > 0 ? '#ff5555' : '#888'};">${s.errors}</td>
    </tr>
  `,
    )
    .join('');

  const body = `
    <h2 style="margin:0 0 16px;color:#fff;">Tedarikçi Sync Özeti</h2>
    <p style="color:#888;font-size:13px;">Çalışma zamanı: ${escapeHtml(new Date(d.runAt).toLocaleString('tr-TR'))}</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
      <thead>
        <tr style="color:#888;font-size:12px;text-align:left;">
          <th style="padding:8px;border-bottom:2px solid #262626;">Tedarikçi</th>
          <th style="padding:8px;border-bottom:2px solid #262626;text-align:right;">Güncelleme</th>
          <th style="padding:8px;border-bottom:2px solid #262626;text-align:right;">Uyarı</th>
          <th style="padding:8px;border-bottom:2px solid #262626;text-align:right;">Hata</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:16px;font-size:14px;">
      Toplam <strong>${d.totalAlerts}</strong> uyarı, <strong>${d.totalErrors}</strong> hata.
    </p>
    <div style="margin-top:24px;">
      <a href="${SITE}/admin/tedarikciler" style="display:inline-block;background:#5DD62C;color:#000;text-decoration:none;font-weight:600;padding:10px 20px;border-radius:12px;">Admin panelinde aç</a>
    </div>
  `;
  return { subject, html: renderEmail({ title: subject, body }) };
}
