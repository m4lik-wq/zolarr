import { CALC } from './constants';

export interface EstimateInput {
  monthlyBillTry: number;
  irradiance: number; // kWh/m²/yıl
}

export function estimateSystem({ monthlyBillTry, irradiance }: EstimateInput): number {
  if (monthlyBillTry <= 0 || irradiance <= 0) return 0;
  const annualKwh = monthlyBillTry * 12;
  const denom = CALC.ELECTRICITY_UNIT_PRICE * irradiance * CALC.SYSTEM_EFFICIENCY;
  return annualKwh / denom;
}

export function annualSavings({
  systemKwp,
  irradiance,
}: {
  systemKwp: number;
  irradiance: number;
}): number {
  return systemKwp * irradiance * CALC.ELECTRICITY_UNIT_PRICE * CALC.SYSTEM_EFFICIENCY;
}

export function paybackYears({
  systemKwp,
  annualSavingsTry,
}: {
  systemKwp: number;
  annualSavingsTry: number;
}): number {
  if (annualSavingsTry <= 0) return 0;
  return (systemKwp * CALC.SYSTEM_COST_PER_KWP) / annualSavingsTry;
}

export function twentyFiveYearSavings({ annualSavingsTry }: { annualSavingsTry: number }): number {
  return annualSavingsTry * 25 * CALC.INFLATION_FACTOR;
}
