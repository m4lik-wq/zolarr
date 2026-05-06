'use client';

import * as React from 'react';
import { SectionCard } from './section-card';

interface Prefs {
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = 'zolarr-cookie-prefs';
const DEFAULT_PREFS: Prefs = { analytics: false, marketing: false };

function loadPrefs(): Prefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function CookieSection() {
  const [prefs, setPrefs] = React.useState<Prefs>(DEFAULT_PREFS);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => setPrefs(loadPrefs()), []);

  function save() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <SectionCard title="Çerez Tercihleri" description="Hangi çerezlerin tarayıcınıza kaydedileceğini seçin.">
      <div className="space-y-3">
        <label className="flex items-center justify-between">
          <span>
            <strong className="block">Zorunlu çerezler</strong>
            <span className="text-sm text-[var(--color-text-muted)]">Sayfa çalışması için gerekli, kapatılamaz.</span>
          </span>
          <input type="checkbox" checked disabled className="h-5 w-5 accent-[var(--color-brand)]" />
        </label>
        <label className="flex items-center justify-between">
          <span>
            <strong className="block">Analitik</strong>
            <span className="text-sm text-[var(--color-text-muted)]">Anonim ziyaretçi istatistikleri.</span>
          </span>
          <input type="checkbox" checked={prefs.analytics} onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))} className="h-5 w-5 accent-[var(--color-brand)]" />
        </label>
        <label className="flex items-center justify-between">
          <span>
            <strong className="block">Pazarlama</strong>
            <span className="text-sm text-[var(--color-text-muted)]">Kişiselleştirilmiş tanıtımlar.</span>
          </span>
          <input type="checkbox" checked={prefs.marketing} onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))} className="h-5 w-5 accent-[var(--color-brand)]" />
        </label>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button type="button" onClick={save} className="rounded-2xl bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-[var(--color-bg-base)]">
          Tercihlerimi Kaydet
        </button>
        {saved && <span className="text-sm text-[var(--color-brand)]">✓ Kaydedildi</span>}
      </div>
    </SectionCard>
  );
}
