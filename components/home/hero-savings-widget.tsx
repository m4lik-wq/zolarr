'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IRRADIANCE, findIrradiance } from '@/lib/data/irradiance';
import { estimateSystem, annualSavings, paybackYears } from '@/lib/calculator';

interface Result {
  systemKwp: number;
  savingsTry: number;
  paybackYears: number;
}

const tryFmt = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
});
const numFmt = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });

export function HeroSavingsWidget() {
  const [bill, setBill] = React.useState('');
  const [city, setCity] = React.useState('İstanbul');
  const [result, setResult] = React.useState<Result | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  function handleCompute(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const billNum = Number(bill.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (!billNum || billNum <= 0) {
      setError('Aylık faturanızı TL cinsinden giriniz.');
      setResult(null);
      return;
    }
    const irr = findIrradiance(city);
    const kwp = estimateSystem({ monthlyBillTry: billNum, irradiance: irr });
    const sav = annualSavings({ systemKwp: kwp, irradiance: irr });
    const yrs = paybackYears({ systemKwp: kwp, annualSavingsTry: sav });
    setResult({ systemKwp: kwp, savingsTry: sav, paybackYears: yrs });
  }

  return (
    <div className="glass rounded-2xl p-6 shadow-[var(--shadow-glass)]">
      <h3 className="mb-1 font-display text-xl font-semibold">Tasarrufunuzu hesaplayın</h3>
      <p className="mb-4 text-sm text-[var(--color-text-muted)]">
        Faturanızı ve şehrinizi yazın, sizi 30 saniyede bilgilendirelim.
      </p>

      <form onSubmit={handleCompute} className="space-y-3" noValidate>
        <div className="space-y-1">
          <label className="text-sm" htmlFor="bill">
            Aylık fatura (TL)
          </label>
          <Input
            id="bill"
            inputMode="numeric"
            placeholder="örn. 800"
            value={bill}
            onChange={(e) => setBill(e.target.value)}
            error={!!error}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm" htmlFor="city">
            Şehir
          </label>
          <select
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-11 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          >
            {IRRADIANCE.map((r) => (
              <option key={r.province} value={r.province}>
                {r.province}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="w-full">
          Hesapla
        </Button>
        {error && (
          <p role="alert" className="text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}
      </form>

      {result && (
        <dl className="mt-5 space-y-3 border-t border-[var(--color-border-glass)] pt-4">
          <div className="flex justify-between font-mono">
            <dt className="text-sm text-[var(--color-text-muted)]">Tahmini sistem (kWp)</dt>
            <dd className="text-base font-semibold text-[var(--color-brand)]">
              {numFmt.format(result.systemKwp)} kWp
            </dd>
          </div>
          <div className="flex justify-between font-mono">
            <dt className="text-sm text-[var(--color-text-muted)]">Yıllık tasarruf</dt>
            <dd className="text-base font-semibold">{tryFmt.format(result.savingsTry)}</dd>
          </div>
          <div className="flex justify-between font-mono">
            <dt className="text-sm text-[var(--color-text-muted)]">Geri ödeme</dt>
            <dd className="text-base font-semibold">{numFmt.format(result.paybackYears)} yıl</dd>
          </div>
          <Button asChild variant="secondary" className="w-full">
            <Link href="/teklif/al">Detaylı teklif al</Link>
          </Button>
        </dl>
      )}
    </div>
  );
}
