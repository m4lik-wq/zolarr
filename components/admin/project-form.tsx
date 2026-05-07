'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  adminProjectSchema,
  type AdminProjectInput,
} from '@/lib/validation/admin-project-schema';
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
} from '@/lib/server-actions/admin/projects';

interface Props {
  mode: 'create' | 'edit';
  initial?: Partial<AdminProjectInput> & { id?: string };
}

const TYPE_OPTIONS: Array<{ value: AdminProjectInput['type']; label: string }> = [
  { value: 'konut', label: 'Konut' },
  { value: 'ticari', label: 'Ticari' },
  { value: 'tarim', label: 'Tarım' },
];

export function ProjectForm({ mode, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = React.useState<AdminProjectInput>({
    slug: initial?.slug ?? '',
    title: initial?.title ?? '',
    type: initial?.type ?? 'konut',
    location: initial?.location ?? '',
    capacityKwp: initial?.capacityKwp ?? 0,
    coverImage: initial?.coverImage ?? '',
    description: initial?.description ?? '',
    beforeImage: initial?.beforeImage ?? null,
    afterImage: initial?.afterImage ?? null,
    galleryImages: initial?.galleryImages ?? [],
    productSlugs: initial?.productSlugs ?? [],
    customerQuote: initial?.customerQuote ?? '',
    customerName: initial?.customerName ?? '',
    annualSavingsTry: initial?.annualSavingsTry ?? null,
    completionDate: initial?.completionDate ?? null,
    isPublished: initial?.isPublished ?? false,
    sortOrder: initial?.sortOrder ?? 0,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  function set<K extends keyof AdminProjectInput>(k: K, v: AdminProjectInput[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function setListField(k: 'galleryImages' | 'productSlugs', raw: string) {
    const list = raw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    set(k, list);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = adminProjectSchema.safeParse(form);
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
        ? await createProjectAction(r.data)
        : await updateProjectAction(initial!.id!, r.data);
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
    if (!confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;
    await deleteProjectAction(initial!.id!);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset className="glass space-y-4 rounded-2xl p-6">
        <legend className="font-display text-base font-semibold">Temel Bilgiler</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Başlık *" error={errors.title}>
            <Input value={form.title} onChange={(e) => set('title', e.target.value)} />
          </Field>
          <Field label="Slug *" error={errors.slug}>
            <Input
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="ornek-proje"
            />
          </Field>
        </div>
        <Field label="Tip *" error={errors.type}>
          <div className="flex flex-wrap gap-3">
            {TYPE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name="project-type"
                  value={opt.value}
                  checked={form.type === opt.value}
                  onChange={() => set('type', opt.value)}
                  className="h-4 w-4 accent-[var(--color-brand)]"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Konum *" error={errors.location}>
            <Input
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="Konya, Karatay"
            />
          </Field>
          <Field label="Kapasite (kWp) *" error={errors.capacityKwp}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.capacityKwp}
              onChange={(e) => set('capacityKwp', Number(e.target.value))}
            />
          </Field>
        </div>
        <Field label="Açıklama (markdown destekli)" error={errors.description}>
          <textarea
            rows={6}
            maxLength={8000}
            value={form.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2"
          />
        </Field>
      </fieldset>

      <fieldset className="glass space-y-4 rounded-2xl p-6">
        <legend className="font-display text-base font-semibold">Görseller</legend>
        <Field label="Kapak Görseli (URL) *" error={errors.coverImage}>
          <Input
            value={form.coverImage}
            onChange={(e) => set('coverImage', e.target.value)}
            placeholder="https://..."
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Öncesi Görseli (URL)" error={errors.beforeImage}>
            <Input
              value={form.beforeImage ?? ''}
              onChange={(e) => set('beforeImage', e.target.value || null)}
              placeholder="https://..."
            />
          </Field>
          <Field label="Sonrası Görseli (URL)" error={errors.afterImage}>
            <Input
              value={form.afterImage ?? ''}
              onChange={(e) => set('afterImage', e.target.value || null)}
              placeholder="https://..."
            />
          </Field>
        </div>
        <Field
          label="Galeri Görselleri (her satıra bir URL, en fazla 20)"
          error={errors.galleryImages}
        >
          <textarea
            rows={3}
            value={form.galleryImages.join('\n')}
            onChange={(e) => setListField('galleryImages', e.target.value)}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2 font-mono text-sm"
            placeholder="https://..."
          />
        </Field>
      </fieldset>

      <fieldset className="glass space-y-4 rounded-2xl p-6">
        <legend className="font-display text-base font-semibold">Kullanılan Ürünler</legend>
        <Field
          label="Ürün Slug'ları (her satıra bir slug, en fazla 20)"
          error={errors.productSlugs}
        >
          <textarea
            rows={3}
            value={form.productSlugs.join('\n')}
            onChange={(e) => setListField('productSlugs', e.target.value)}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2 font-mono text-sm"
            placeholder="ornek-urun-slug"
          />
        </Field>
      </fieldset>

      <fieldset className="glass space-y-4 rounded-2xl p-6">
        <legend className="font-display text-base font-semibold">Müşteri Görüşü</legend>
        <Field label="Müşteri Yorumu" error={errors.customerQuote}>
          <textarea
            rows={3}
            maxLength={1000}
            value={form.customerQuote ?? ''}
            onChange={(e) => set('customerQuote', e.target.value)}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Müşteri Adı" error={errors.customerName}>
            <Input
              value={form.customerName ?? ''}
              onChange={(e) => set('customerName', e.target.value)}
            />
          </Field>
          <Field label="Yıllık Tasarruf (TRY)" error={errors.annualSavingsTry}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.annualSavingsTry ?? ''}
              onChange={(e) =>
                set(
                  'annualSavingsTry',
                  e.target.value === '' ? null : Number(e.target.value)
                )
              }
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="glass space-y-4 rounded-2xl p-6">
        <legend className="font-display text-base font-semibold">Yayın Ayarları</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tamamlanma Tarihi" error={errors.completionDate}>
            <Input
              type="date"
              value={form.completionDate ?? ''}
              onChange={(e) => set('completionDate', e.target.value || null)}
            />
          </Field>
          <Field label="Sıralama" error={errors.sortOrder}>
            <Input
              type="number"
              min={0}
              step={1}
              value={form.sortOrder}
              onChange={(e) => set('sortOrder', Number(e.target.value))}
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => set('isPublished', e.target.checked)}
            className="h-4 w-4 accent-[var(--color-brand)]"
          />
          Yayında
        </label>
      </fieldset>

      {errors._form && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {errors._form}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? 'Kaydediliyor…' : mode === 'create' ? 'Ekle' : 'Kaydet'}
          </Button>
          {saved && <span className="text-sm text-[var(--color-brand)]">✓ Kaydedildi</span>}
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
