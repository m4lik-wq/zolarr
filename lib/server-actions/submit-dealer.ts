'use server';

import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { dealerFullSchema, type DealerFullInput } from '@/lib/validation/dealer-schema';
import { generateQuoteNumber } from '@/lib/utils/quote-number';

export type SubmitDealerResult =
  | { ok: true; applicationNumber: string }
  | { ok: false; error: string };

export async function submitDealer(input: DealerFullInput): Promise<SubmitDealerResult> {
  const parsed = dealerFullSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Form verileri geçersiz, lütfen alanları kontrol edin.',
    };
  }
  const data = parsed.data;
  const supabase = await createClient();

  for (let attempt = 0; attempt < 3; attempt++) {
    const applicationNumber = generateQuoteNumber('ZQT').replace('ZQT', 'ZDA');
    const { error } = await supabase.from('dealer_applications').insert({
      application_number: applicationNumber,
      company_name: data.companyName,
      tax_office: data.taxOffice || null,
      tax_number: data.taxNumber || null,
      company_address: data.companyAddress || null,
      contact_name: data.contactName,
      contact_role: data.contactRole || null,
      contact_phone: data.contactPhone,
      contact_email: data.contactEmail,
      service_categories: data.serviceCategories,
      service_areas: data.serviceAreas,
      experience_years: data.experienceYears ?? null,
      document_urls: data.documentUrls,
    });

    if (!error) {
      return { ok: true, applicationNumber };
    }

    if ((error as { code?: string }).code === '23505') {
      continue;
    }

    return {
      ok: false,
      error: 'Başvurunuz kaydedilemedi, lütfen kısa süre sonra tekrar deneyin.',
    };
  }

  return {
    ok: false,
    error: 'Başvurunuz kaydedilemedi, lütfen kısa süre sonra tekrar deneyin.',
  };
}
