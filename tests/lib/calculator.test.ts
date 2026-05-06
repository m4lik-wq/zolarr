import { describe, it, expect } from 'vitest';
import { estimateSystem, annualSavings, paybackYears, twentyFiveYearSavings } from '@/lib/calculator';

describe('calculator', () => {
  // İstanbul: ~1450 kWh/m²/yıl, fatura 800 TL/ay, UNIT 3.20, EFF 0.85
  // Sistem kWp = (800*12) / (3.20 * 1450 * 0.85) = 9600 / 3944 ≈ 2.434
  it('estimateSystem matches formula for İstanbul + 800 TL', () => {
    const kwp = estimateSystem({ monthlyBillTry: 800, irradiance: 1450 });
    expect(kwp).toBeCloseTo(2.434, 2);
  });

  it('annualSavings = kWp * irradiance * unit_price * efficiency', () => {
    const try_ = annualSavings({ systemKwp: 2.434, irradiance: 1450 });
    // 2.434 * 1450 * 3.20 * 0.85 ≈ 9600
    expect(try_).toBeCloseTo(9600, 0);
  });

  it('paybackYears = system_cost / annual_savings', () => {
    // cost = 2.434 * 14000 = 34076 ; savings = 9600 ; payback ≈ 3.55
    const years = paybackYears({ systemKwp: 2.434, annualSavingsTry: 9600 });
    expect(years).toBeCloseTo(3.55, 1);
  });

  it('twentyFiveYearSavings applies inflation factor', () => {
    // 9600 * 25 * 1.05 = 252000
    const total = twentyFiveYearSavings({ annualSavingsTry: 9600 });
    expect(total).toBeCloseTo(252000, 0);
  });

  it('rounds gracefully for zero bill', () => {
    expect(estimateSystem({ monthlyBillTry: 0, irradiance: 1450 })).toBe(0);
  });
});
