import { describe, it, expect } from 'vitest';
import { stockAlertEmail } from '@/lib/email/templates/stock-alert';

describe('stockAlertEmail', () => {
  it('mentions product name and link', () => {
    const e = stockAlertEmail({
      productName: 'Solar Panel 540W',
      productSlug: 'solar-panel-540w',
      userName: 'Ali Y',
    });
    expect(e.html).toContain('Solar Panel 540W');
    expect(e.html).toContain('/magaza/solar-panel-540w');
  });
  it('greets gracefully without name', () => {
    const e = stockAlertEmail({ productName: 'X', productSlug: 'x', userName: null });
    expect(e.html.toLowerCase()).toMatch(/merhaba/);
  });
  it('subject mentions stock', () => {
    const e = stockAlertEmail({ productName: 'X', productSlug: 'x', userName: null });
    expect(e.subject.toLowerCase()).toMatch(/stok|stoğa|stoğa girdi/);
  });
});
