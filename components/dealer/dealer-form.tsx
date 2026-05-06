'use client';

import * as React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dealerFullSchema, type DealerFullInput } from '@/lib/validation/dealer-schema';
import { submitDealer } from '@/lib/server-actions/submit-dealer';
import { DealerSuccess } from './dealer-success';

const SERVICE_CATEGORIES = [
  'panel',
  'invertor',
  'batarya',
  'kit',
  'aksesuar',
  'kurulum',
  'bakım',
];

const TABS = [
  { v: 'company', label: 'Firma' },
  { v: 'contact', label: 'Yetkili' },
  { v: 'service', label: 'Hizmet' },
  { v: 'docs', label: 'Belgeler' },
  { v: 'confirm', label: 'Onay' },
] as const;

type TabValue = (typeof TABS)[number]['v'];

const initial: DealerFullInput = {
  companyName: '',
  taxOffice: '',
  taxNumber: '',
  companyAddress: '',
  contactName: '',
  contactRole: '',
  contactPhone: '',
  contactEmail: '',
  serviceCategories: [],
  serviceAreas: [],
  experienceYears: undefined,
  documentUrls: [],
  kvkkAccepted: false,
};

export function DealerForm() {
  const [tab, setTab] = React.useState<TabValue>('company');
  const [form, setForm] = React.useState<DealerFullInput>(initial);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);
  const [appNumber, setAppNumber] = React.useState<string | null>(null);

  function set<K extends keyof DealerFullInput>(key: K, value: DealerFullInput[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit() {
    const r = dealerFullSchema.safeParse(form);
    if (!r.success) {
      const map: Record<string, string> = {};
      for (const issue of r.error.issues) {
        map[issue.path[0] as string] = issue.message;
      }
      setErrors(map);
      return;
    }
    setErrors({});
    setPending(true);
    try {
      const res = await submitDealer(r.data);
      if (res.ok) setAppNumber(res.applicationNumber);
      else setErrors({ _form: res.error });
    } catch {
      setErrors({ _form: 'Beklenmeyen bir hata oluştu, lütfen tekrar deneyin.' });
    } finally {
      setPending(false);
    }
  }

  if (appNumber) return <DealerSuccess applicationNumber={appNumber} />;

  const otherErrorCount = Object.keys(errors).filter((k) => k !== '_form').length;

  return (
    <Tabs.Root value={tab} onValueChange={(v) => setTab(v as TabValue)}>
      <Tabs.List className="mb-6 flex flex-wrap gap-2 border-b border-[var(--color-border-glass)] pb-2">
        {TABS.map((t) => (
          <Tabs.Trigger
            key={t.v}
            value={t.v}
            className="rounded-xl px-4 py-2 font-display text-sm data-[state=active]:bg-[var(--color-brand)] data-[state=active]:text-[var(--color-bg-base)]"
          >
            {t.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="company" className="space-y-4">
        <Field label="Firma adı *" error={errors.companyName}>
          <Input
            value={form.companyName}
            onChange={(e) => set('companyName', e.target.value)}
          />
        </Field>
        <Field label="Vergi dairesi" error={errors.taxOffice}>
          <Input
            value={form.taxOffice ?? ''}
            onChange={(e) => set('taxOffice', e.target.value)}
          />
        </Field>
        <Field label="Vergi numarası" error={errors.taxNumber}>
          <Input
            value={form.taxNumber ?? ''}
            onChange={(e) => set('taxNumber', e.target.value)}
          />
        </Field>
        <Field label="Firma adresi" error={errors.companyAddress}>
          <Input
            value={form.companyAddress ?? ''}
            onChange={(e) => set('companyAddress', e.target.value)}
          />
        </Field>
        <NavRow onNext={() => setTab('contact')} />
      </Tabs.Content>

      <Tabs.Content value="contact" className="space-y-4">
        <Field label="Yetkili adı *" error={errors.contactName}>
          <Input
            value={form.contactName}
            onChange={(e) => set('contactName', e.target.value)}
          />
        </Field>
        <Field label="Görev" error={errors.contactRole}>
          <Input
            value={form.contactRole ?? ''}
            onChange={(e) => set('contactRole', e.target.value)}
          />
        </Field>
        <Field label="Telefon *" error={errors.contactPhone}>
          <Input
            value={form.contactPhone}
            onChange={(e) => set('contactPhone', e.target.value)}
            placeholder="+90 (5__) ___ __ __"
          />
        </Field>
        <Field label="E-posta *" error={errors.contactEmail}>
          <Input
            type="email"
            value={form.contactEmail}
            onChange={(e) => set('contactEmail', e.target.value)}
          />
        </Field>
        <NavRow onPrev={() => setTab('company')} onNext={() => setTab('service')} />
      </Tabs.Content>

      <Tabs.Content value="service" className="space-y-4">
        <fieldset>
          <legend className="text-sm font-medium">Hizmet kategorileri</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {SERVICE_CATEGORIES.map((c) => {
              const active = form.serviceCategories.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    set(
                      'serviceCategories',
                      active
                        ? form.serviceCategories.filter((x) => x !== c)
                        : [...form.serviceCategories, c]
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-xs ${
                    active
                      ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/15 text-[var(--color-brand)]'
                      : 'border-[var(--color-border)]'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </fieldset>
        <Field label="Hizmet bölgeleri (virgülle ayırın)">
          <Input
            value={form.serviceAreas.join(', ')}
            onChange={(e) =>
              set(
                'serviceAreas',
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            placeholder="İstanbul, Ankara, ..."
          />
        </Field>
        <Field label="Tecrübe yılı" error={errors.experienceYears}>
          <Input
            inputMode="numeric"
            value={form.experienceYears?.toString() ?? ''}
            onChange={(e) =>
              set('experienceYears', e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </Field>
        <NavRow onPrev={() => setTab('contact')} onNext={() => setTab('docs')} />
      </Tabs.Content>

      <Tabs.Content value="docs" className="space-y-4">
        <p className="text-sm text-[var(--color-text-muted)]">
          Yetki belgesi, sertifika, sigorta vb. dokümanları PDF/JPG olarak yükleyin (opsiyonel —
          Faz 7&apos;de tamamlanacak).
        </p>
        <p className="rounded-2xl border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-text-muted)]">
          Belge yükleme yakında.
        </p>
        <NavRow onPrev={() => setTab('service')} onNext={() => setTab('confirm')} />
      </Tabs.Content>

      <Tabs.Content value="confirm" className="space-y-4">
        <p className="text-sm">
          Yukarıdaki bilgileri kontrol edin. Onaylıyorsanız KVKK metnini de onayladıktan sonra
          başvurunuzu gönderin.
        </p>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.kvkkAccepted}
            onChange={(e) => set('kvkkAccepted', e.target.checked)}
            className="mt-1 h-4 w-4 accent-[var(--color-brand)]"
          />
          <span>
            KVKK aydınlatma metnini okudum ve verilerimin bayi başvurusu için işlenmesine onay
            veriyorum. *
          </span>
        </label>
        {errors.kvkkAccepted && (
          <p className="text-sm text-[var(--color-danger)]">{errors.kvkkAccepted}</p>
        )}
        {errors._form && (
          <p role="alert" className="text-sm text-[var(--color-danger)]">
            {errors._form}
          </p>
        )}
        {otherErrorCount > 0 && (
          <p className="text-sm text-[var(--color-danger)]">
            Lütfen önceki sekmelerdeki zorunlu alanları doldurun.
          </p>
        )}
        <NavRow onPrev={() => setTab('docs')} onSubmit={handleSubmit} pending={pending} />
      </Tabs.Content>
    </Tabs.Root>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-sm text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}

function NavRow({
  onPrev,
  onNext,
  onSubmit,
  pending,
}: {
  onPrev?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  pending?: boolean;
}) {
  return (
    <div className="flex justify-between gap-2 pt-2">
      {onPrev ? (
        <Button type="button" variant="ghost" onClick={onPrev}>
          Geri
        </Button>
      ) : (
        <span />
      )}
      {onNext ? (
        <Button type="button" onClick={onNext}>
          Devam
        </Button>
      ) : onSubmit ? (
        <Button type="button" onClick={onSubmit} disabled={pending}>
          {pending ? 'Gönderiliyor…' : 'Başvuruyu Gönder'}
        </Button>
      ) : null}
    </div>
  );
}
