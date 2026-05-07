'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  campaignSchema,
  type CampaignInput,
} from '@/lib/validation/campaign-schema';
import {
  createCampaignAction,
  updateCampaignAction,
  deleteCampaignAction,
} from '@/lib/server-actions/admin/upsert-campaign';

interface Props {
  mode: 'create' | 'edit';
  initial?: Partial<CampaignInput> & { id?: string };
}

function toDateInput(value: string | null | undefined): string {
  if (!value) return '';
  // value: ISO string like 2026-05-07T12:00:00.000Z -> need YYYY-MM-DD
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function fromDateInput(value: string): string | null {
  if (!value) return null;
  // YYYY-MM-DD -> ISO at midnight UTC
  return new Date(`${value}T00:00:00Z`).toISOString();
}

export function CampaignForm({ mode, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = React.useState<CampaignInput>({
    title: initial?.title ?? '',
    subtitle: initial?.subtitle ?? '',
    ctaLabel: initial?.ctaLabel ?? '',
    ctaHref: initial?.ctaHref ?? '',
    bgImageUrl: initial?.bgImageUrl ?? '',
    startsAt: initial?.startsAt ?? null,
    endsAt: initial?.endsAt ?? null,
    isActive: initial?.isActive ?? true,
    sortOrder: initial?.sortOrder ?? 0,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  function set<K extends keyof CampaignInput>(k: K, v: CampaignInput[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = campaignSchema.safeParse(form);
    if (!r.success) {
      const map: Record<string, string> = {};
      for (const issue of r.error.issues) {
        const key = issue.path[0] as string;
        if (!map[key]) map[key] = issue.message;
      }
      setErrors(map);
      return;
    }
    setErrors({});
    setPending(true);
    setSaved(false);
    const res =
      mode === 'create'
        ? await createCampaignAction(r.data)
        : await updateCampaignAction(initial!.id!, r.data);
    setPending(false);
    if (res && !res.ok) {
      setErrors({ _form: res.error });
      return;
    }
    if (res && res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function onDelete() {
    if (!confirm('Bu kampanyayi silmek istediginize emin misiniz?')) return;
    await deleteCampaignAction(initial!.id!);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset className="glass space-y-4 rounded-2xl p-6">
        <legend className="font-display text-base font-semibold">Kampanya Bilgileri</legend>
        <Field label="Baslik *" error={errors.title}>
          <Input
            value={form.title}
            maxLength={200}
            onChange={(e) => set('title', e.target.value)}
          />
        </Field>
        <Field label="Alt baslik" error={errors.subtitle}>
          <textarea
            rows={2}
            maxLength={500}
            value={form.subtitle ?? ''}
            onChange={(e) => set('subtitle', e.target.value)}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="CTA etiketi" error={errors.ctaLabel}>
            <Input
              value={form.ctaLabel ?? ''}
              maxLength={50}
              placeholder="Hemen incele"
              onChange={(e) => set('ctaLabel', e.target.value)}
            />
          </Field>
          <Field label="CTA bagli URL/path" error={errors.ctaHref}>
            <Input
              value={form.ctaHref ?? ''}
              placeholder="/magaza veya https://..."
              onChange={(e) => set('ctaHref', e.target.value)}
            />
          </Field>
        </div>
        <Field label="Arkaplan gorseli (URL)" error={errors.bgImageUrl}>
          <Input
            value={form.bgImageUrl ?? ''}
            placeholder="https://images.unsplash.com/..."
            onChange={(e) => set('bgImageUrl', e.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Baslangic tarihi" error={errors.startsAt}>
            <Input
              type="date"
              value={toDateInput(form.startsAt)}
              onChange={(e) => set('startsAt', fromDateInput(e.target.value))}
            />
          </Field>
          <Field label="Bitis tarihi" error={errors.endsAt}>
            <Input
              type="date"
              value={toDateInput(form.endsAt)}
              onChange={(e) => set('endsAt', fromDateInput(e.target.value))}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Siralama (yuksek olan ust)" error={errors.sortOrder}>
            <Input
              type="number"
              min={0}
              step={1}
              value={form.sortOrder}
              onChange={(e) => set('sortOrder', Number(e.target.value))}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm pt-7">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
              className="h-4 w-4 accent-[var(--color-brand)]"
            />
            Aktif (ana sayfada gorunsun)
          </label>
        </div>
      </fieldset>

      {errors._form && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {errors._form}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? 'Kaydediliyor...' : mode === 'create' ? 'Ekle' : 'Kaydet'}
          </Button>
          {saved && <span className="text-sm text-[var(--color-brand)]">Kaydedildi</span>}
        </div>
        {mode === 'edit' && (
          <Button type="button" variant="destructive" onClick={onDelete}>
            Sil
          </Button>
        )}
      </div>
    </form>
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
