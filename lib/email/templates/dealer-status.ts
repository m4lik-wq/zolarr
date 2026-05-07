import { renderEmail, escapeHtml } from '../template';

export type DealerStatus = 'new' | 'reviewing' | 'approved' | 'rejected';

export interface DealerStatusEmailData {
  applicationNumber: string;
  contactName: string;
  companyName: string;
  newStatus: DealerStatus;
  adminNotes: string | null;
}

export interface RenderedEmail {
  subject: string;
  html: string;
}

const SUBJECT: Record<DealerStatus, string> = {
  new: 'Bayi başvurunuz alındı',
  reviewing: 'Bayi başvurunuz incelemede',
  approved: 'Bayilik başvurunuz onaylandı 🎉',
  rejected: 'Bayilik başvurunuz hakkında',
};

export function dealerStatusEmail(d: DealerStatusEmailData): RenderedEmail {
  const firstName = escapeHtml(d.contactName.split(' ')[0] ?? d.contactName);
  const company = escapeHtml(d.companyName);
  const subject = `${SUBJECT[d.newStatus]} · ${d.applicationNumber}`;
  let body = `<h2 style="margin:0 0 16px;color:#fff;">${SUBJECT[d.newStatus]}</h2>`;
  if (d.newStatus === 'reviewing') {
    body += `<p>Merhaba ${firstName}, <strong>${company}</strong> başvurunuz inceleme aşamasında. 3 iş günü içinde dönüş yapacağız.</p>`;
  } else if (d.newStatus === 'approved') {
    body += `<p>Merhaba ${firstName}, <strong>${company}</strong> bayilik başvurunuz onaylandı. Yetkili kişimiz sözleşme süreci için sizinle iletişime geçecek.</p>`;
  } else if (d.newStatus === 'rejected') {
    body += `<p>Merhaba ${firstName}, <strong>${company}</strong> başvurunuzu değerlendirdik ancak bu süreçte bayilik açmıyoruz. İlginiz için teşekkür ederiz.</p>`;
    if (d.adminNotes) {
      body += `<p style="color:#888;font-size:13px;">Notumuz: ${escapeHtml(d.adminNotes)}</p>`;
    }
  } else {
    body += `<p>Merhaba ${firstName}, <strong>${company}</strong> başvurunuzu aldık.</p>`;
  }
  body += `<p style="margin:24px 0 0;color:#888;font-size:13px;"><strong>Başvuru No:</strong> ${escapeHtml(d.applicationNumber)}</p>`;
  return { subject, html: renderEmail({ title: subject, body }) };
}
