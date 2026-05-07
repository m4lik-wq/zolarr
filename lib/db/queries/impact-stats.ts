import 'server-only';
import { createClient } from '@/lib/supabase/server';

export interface ImpactStats {
  installations: number;
  totalKwp: number;
  totalKwhPerYear: number; // kWp * 1500 estimate
  co2SavedTons: number; // kWh * 0.5kg / 1000
}

export async function getImpactStats(): Promise<ImpactStats> {
  const sb = await createClient();
  const { data } = await sb
    .from('projects')
    .select('capacity_kwp')
    .eq('is_published', true);
  const projects = (data ?? []) as Array<{ capacity_kwp: number | string }>;
  const totalKwp = projects.reduce((sum, p) => sum + Number(p.capacity_kwp), 0);
  const installations = projects.length;
  const totalKwhPerYear = totalKwp * 1500; // Türkiye ortalaması ~1500 kWh/kWp/yıl
  const co2SavedTons = (totalKwhPerYear * 0.5) / 1000; // 0.5 kg CO2 / kWh, ton'a çevir

  // Eğer DB boşsa fallback değerler (ilk lansman için)
  if (installations === 0) {
    return {
      installations: 500,
      totalKwp: 2500,
      totalKwhPerYear: 3_750_000,
      co2SavedTons: 1875,
    };
  }
  return { installations, totalKwp, totalKwhPerYear, co2SavedTons };
}
