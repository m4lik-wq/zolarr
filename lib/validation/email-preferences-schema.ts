import { z } from 'zod';

export const emailPreferencesSchema = z.object({
  marketing: z.boolean(),
  stock_alerts: z.boolean(),
  quote_status: z.boolean(),
  dealer_status: z.boolean(),
});

export type EmailPreferencesInput = z.infer<typeof emailPreferencesSchema>;
