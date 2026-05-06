'use server';

import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { quoteFullSchema, type QuoteFullInput } from '@/lib/validation/quote-schema';
import { generateQuoteNumber } from '@/lib/utils/quote-number';
import { findIrradiance } from '@/lib/data/irradiance';
import { estimateSystem, annualSavings, paybackYears } from '@/lib/calculator';

export type SubmitQuoteResult =
  | { ok: true; quoteNumber: string }
  | { ok: false; error: string };

export async function submitQuote(input: QuoteFullInput): Promise<SubmitQuoteResult> {
  const parsed = quoteFullSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Form verileri geçersiz, lütfen alanları kontrol edin.' };
  }
  const data = parsed.data;

  const irradiance = findIrradiance(data.city);
  const totalKwh = data.appliances.reduce((sum, a) => sum + (a.consumptionKwh ?? 0), 0);
  const monthlyKwh = totalKwh > 0 ? totalKwh / 12 : 0;
  const monthlyBillTry = monthlyKwh * 4.5;
  const estKwp = monthlyBillTry > 0 ? estimateSystem({ monthlyBillTry, irradiance }) : null;
  const annual = estKwp ? annualSavings({ systemKwp: estKwp, irradiance }) : null;
  const payback = estKwp && annual ? paybackYears({ systemKwp: estKwp, annualSavingsTry: annual }) : null;

  const supabase = await createClient();

  for (let attempt = 0; attempt < 3; attempt++) {
    const quoteNumber = generateQuoteNumber('ZQT');
    const { error } = await supabase.from('quotes').insert({
      quote_number: quoteNumber,
      contact_name: data.contactName,
      contact_phone: data.contactPhone,
      contact_email: data.contactEmail,
      contact_time_preference: data.contactTimePreference,
      city: data.city,
      district: data.district || null,
      installation_location: data.installationLocation,
      location_notes: data.locationNotes || null,
      appliances: data.appliances,
      description: data.description || null,
      estimated_kwp: estKwp ? Number(estKwp.toFixed(3)) : null,
      estimated_savings_try: annual ? Number(annual.toFixed(2)) : null,
      estimated_payback_years: payback ? Number(payback.toFixed(2)) : null,
    });

    if (!error) {
      return { ok: true, quoteNumber };
    }

    if ((error as { code?: string }).code === '23505') {
      continue;
    }

    return { ok: false, error: 'Talebiniz kaydedilemedi, lütfen kısa süre sonra tekrar deneyin.' };
  }

  return { ok: false, error: 'Talebiniz kaydedilemedi, lütfen kısa süre sonra tekrar deneyin.' };
}
