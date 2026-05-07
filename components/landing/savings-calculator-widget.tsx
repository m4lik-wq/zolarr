'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { findIrradiance, IRRADIANCE } from '@/lib/data/irradiance';
import { estimateSystem, annualSavings } from '@/lib/calculator';
import { formatTry } from '@/lib/utils/price';

const CITIES = IRRADIANCE.map((row) => row.province);

export function SavingsCalculatorWidget() {
  const [bill, setBill] = React.useState<number>(2500);
  const [city, setCity] = React.useState<string>('İstanbul');
  const [showResult, setShowResult] = React.useState(false);

  const irr = findIrradiance(city);
  const monthlyBillTry = bill;
  const estKwp =
    monthlyBillTry > 0 ? estimateSystem({ monthlyBillTry, irradiance: irr }) : 0;
  const annualSave =
    estKwp > 0 ? annualSavings({ systemKwp: estKwp, irradiance: irr }) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="glass rounded-3xl border border-[var(--color-border-glass)] p-6 backdrop-blur-xl bg-[var(--color-bg-elevated)]/85 shadow-2xl max-w-md"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-warm-gold)] font-mono mb-3">
        Hızlı Hesap
      </p>
      <h3 className="font-display text-2xl mb-5 leading-tight">
        Faturanız ne kadar düşer?
      </h3>
      <label className="block mb-4">
        <span className="text-sm text-[var(--color-text-muted)]">Aylık fatura (TL)</span>
        <input
          type="number"
          value={bill}
          onChange={(e) => {
            setBill(Number(e.target.value) || 0);
            setShowResult(false);
          }}
          className="mt-1 h-11 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-base)] px-4 font-mono text-lg focus:border-[var(--color-brand)] focus:outline-none"
          min={0}
          step={100}
        />
      </label>
      <label className="block mb-5">
        <span className="text-sm text-[var(--color-text-muted)]">Şehriniz</span>
        <select
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setShowResult(false);
          }}
          className="mt-1 h-11 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-base)] px-4 focus:border-[var(--color-brand)] focus:outline-none"
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => setShowResult(true)}
        className="w-full h-12 rounded-2xl bg-[var(--color-brand)] font-medium text-[var(--color-bg-base)] hover:bg-[var(--color-brand-dark)] transition-colors"
      >
        Hesapla
      </button>
      {showResult && estKwp > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-5 pt-5 border-t border-[var(--color-border-glass)] space-y-2 overflow-hidden"
        >
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-muted)]">Önerilen sistem</span>
            <span className="font-mono text-[var(--color-brand)]">
              {estKwp.toFixed(1)} kWp
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-muted)]">Yıllık tasarruf</span>
            <span className="font-mono text-[var(--color-warm-gold)] font-semibold">
              {formatTry(annualSave)}
            </span>
          </div>
          <a
            href={`/teklif/al?bill=${bill}&city=${encodeURIComponent(city)}`}
            className="block mt-3 text-center text-sm text-[var(--color-brand)] hover:underline"
          >
            Detaylı teklif al →
          </a>
        </motion.div>
      )}
    </motion.div>
  );
}
