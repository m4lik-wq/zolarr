'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  adminProductSchema,
  type AdminProductInput,
} from '@/lib/validation/admin-product-schema';
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from '@/lib/server-actions/admin/products';
import type { Category } from '@/lib/db/types';

interface Props {
  mode: 'create' | 'edit';
  initial?: Partial<AdminProductInput> & { id?: string };
  categories: Category[];
}

const TAG_OPTIONS = [
  'kargo_bedava',
  'tercih_edilen',
  'yeni',
  'cok_satan',
  'premium',
  'kampanyada',
  '5_yil_garantili',
] as const;

export function ProductForm({ mode, initial, categories }: Props) {
  const router = useRouter();
  const [form, setForm] = React.useState<AdminProductInput>({
    slug: initial?.slug ?? '',
    name: initial?.name ?? '',
    shortDescription: initial?.shortDescription ?? '',
    description: initial?.description ?? '',
    categoryId: initial?.categoryId ?? null,
    brand: initial?.brand ?? '',
    sku: initial?.sku ?? '',
    price: initial?.price ?? 0,
    discountPrice: initial?.discountPrice ?? null,
    stock: initial?.stock ?? 0,
    trackStock: initial?.trackStock ?? true,
    isActive: initial?.isActive ?? true,
    isFeatured: initial?.isFeatured ?? false,
    images: initial?.images ?? [],
    videos: initial?.videos ?? [],
    pdfs: initial?.pdfs ?? [],
    tags: initial?.tags ?? [],
    warrantyYears: initial?.warrantyYears ?? null,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  function set<K extends keyof AdminProductInput>(k: K, v: AdminProductInput[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function setListField(
    k: 'images' | 'videos' | 'pdfs',
    raw: string
  ) {
    const list = raw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    set(k, list);
  }

  function toggleTag(tag: string) {
    const next = form.tags.includes(tag)
      ? form.tags.filter((t) => t !== tag)
      : [...form.tags, tag];
    set('tags', next);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = adminProductSchema.safeParse(form);
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
        ? await createProductAction(r.data)
        : await updateProductAction(initial!.id!, r.data);
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
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    await deleteProductAction(initial!.id!);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset className="glass space-y-4 rounded-2xl p-6">
        <legend className="font-display text-base font-semibold">Temel Bilgiler</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="İsim *" error={errors.name}>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="Slug *" error={errors.slug}>
            <Input
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="ornek-urun"
            />
          </Field>
        </div>
        <Field label="Kısa açıklama" error={errors.shortDescription}>
          <Input
            value={form.shortDescription ?? ''}
            onChange={(e) => set('shortDescription', e.target.value)}
            maxLength={300}
          />
        </Field>
        <Field label="Açıklama" error={errors.description}>
          <textarea
            rows={6}
            maxLength={8000}
            value={form.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kategori">
            <select
              value={form.categoryId ?? ''}
              onChange={(e) => set('categoryId', e.target.value || null)}
              className="h-11 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4"
            >
              <option value="">— Seçiniz —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Marka">
            <Input
              value={form.brand ?? ''}
              onChange={(e) => set('brand', e.target.value)}
            />
          </Field>
        </div>
        <Field label="SKU">
          <Input value={form.sku ?? ''} onChange={(e) => set('sku', e.target.value)} />
        </Field>
      </fieldset>

      <fieldset className="glass space-y-4 rounded-2xl p-6">
        <legend className="font-display text-base font-semibold">Fiyat ve Stok</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Fiyat (TRY) *" error={errors.price}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(e) => set('price', Number(e.target.value))}
            />
          </Field>
          <Field label="İndirimli Fiyat (TRY)" error={errors.discountPrice}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.discountPrice ?? ''}
              onChange={(e) =>
                set('discountPrice', e.target.value === '' ? null : Number(e.target.value))
              }
            />
          </Field>
          <Field label="Stok" error={errors.stock}>
            <Input
              type="number"
              min={0}
              step={1}
              value={form.stock}
              onChange={(e) => set('stock', Number(e.target.value))}
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.trackStock}
              onChange={(e) => set('trackStock', e.target.checked)}
              className="h-4 w-4 accent-[var(--color-brand)]"
            />
            Stok takip et
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
              className="h-4 w-4 accent-[var(--color-brand)]"
            />
            Aktif (yayında)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => set('isFeatured', e.target.checked)}
              className="h-4 w-4 accent-[var(--color-brand)]"
            />
            Öne çıkar
          </label>
        </div>
      </fieldset>

      <fieldset className="glass space-y-4 rounded-2xl p-6">
        <legend className="font-display text-base font-semibold">Medya</legend>
        <Field label="Görseller (her satıra bir URL, en fazla 5)" error={errors.images}>
          <textarea
            rows={3}
            value={form.images.join('\n')}
            onChange={(e) => setListField('images', e.target.value)}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2 font-mono text-sm"
            placeholder="https://..."
          />
        </Field>
        <Field label="Videolar (her satıra bir URL, en fazla 2)" error={errors.videos}>
          <textarea
            rows={2}
            value={form.videos.join('\n')}
            onChange={(e) => setListField('videos', e.target.value)}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2 font-mono text-sm"
          />
        </Field>
        <Field label="PDF'ler (her satıra bir URL, en fazla 5)" error={errors.pdfs}>
          <textarea
            rows={2}
            value={form.pdfs.join('\n')}
            onChange={(e) => setListField('pdfs', e.target.value)}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2 font-mono text-sm"
          />
        </Field>
      </fieldset>

      <fieldset className="glass space-y-4 rounded-2xl p-6">
        <legend className="font-display text-base font-semibold">Etiketler ve Garanti</legend>
        <Field label="Etiketler">
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((t) => {
              const active = form.tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={
                    active
                      ? 'rounded-full bg-[var(--color-brand)] px-3 py-1 text-xs text-[var(--color-bg-base)]'
                      : 'rounded-full border border-[var(--color-border)] px-3 py-1 text-xs hover:bg-[var(--color-bg-overlay)]'
                  }
                >
                  {t}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Garanti (yıl)" error={errors.warrantyYears}>
          <Input
            type="number"
            min={0}
            step={1}
            value={form.warrantyYears ?? ''}
            onChange={(e) =>
              set('warrantyYears', e.target.value === '' ? null : Number(e.target.value))
            }
          />
        </Field>
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
