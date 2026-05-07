import { describe, it, expect } from 'vitest';
import { supplierSyncSummaryEmail } from '@/lib/email/templates/supplier-sync-summary';

describe('supplierSyncSummaryEmail', () => {
  const sample = {
    runAt: '2026-05-08T06:00:00Z',
    suppliers: [
      { name: 'Tedarikçi A', total: 10, updated: 10, alerts: 2, errors: 0 },
      { name: 'Tedarikçi B', total: 5, updated: 4, alerts: 1, errors: 1 },
    ],
    totalAlerts: 3,
    totalErrors: 1,
  };
  it('subject mentions alert count', () => {
    const e = supplierSyncSummaryEmail(sample);
    expect(e.subject).toContain('3');
  });
  it('html lists each supplier name', () => {
    const e = supplierSyncSummaryEmail(sample);
    expect(e.html).toContain('Tedarikçi A');
    expect(e.html).toContain('Tedarikçi B');
  });
  it('shows error indicator when errors > 0', () => {
    const e = supplierSyncSummaryEmail(sample);
    expect(e.html.toLowerCase()).toMatch(/hata/);
  });
  it('escapes html in supplier names', () => {
    const evil = { ...sample, suppliers: [{ name: '<script>x</script>', total: 1, updated: 1, alerts: 0, errors: 0 }] };
    const e = supplierSyncSummaryEmail(evil);
    expect(e.html).not.toContain('<script>x</script>');
    expect(e.html).toContain('&lt;script&gt;');
  });
});
