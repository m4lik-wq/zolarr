import type { EmailPreferences } from '@/lib/db/types';

export type EmailCategory = 'marketing' | 'stock_alerts' | 'quote_status' | 'dealer_status';

export function canReceive(prefs: EmailPreferences | null | undefined, category: EmailCategory): boolean {
  if (!prefs) return true;
  return prefs[category] !== false;
}
