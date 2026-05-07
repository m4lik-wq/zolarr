'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  adminFaqSchema,
  type AdminFaqInput,
} from '@/lib/validation/admin-faq-schema';
import {
  createFaqAction,
  updateFaqAction,
  deleteFaqAction,
} from '@/lib/server-actions/admin/faqs';

interface Props {
  mode: 'create' | 'edit';
  initial?: Partial<AdminFaqInput> & { id?: string };
}

const CATEGORY_OPTIONS: Array<{ value: AdminFaqInput['category']; label: string }> = [
  { value: 'genel', label: 'Genel' },
  { value: 'teknik', label: 'Teknik' },
  { value: 'fiyat', label: 'Fiyat' },
  { value: 'kurulum', label: 'Kurulum' },
  { value: 'garanti', label: 'Garanti' },
];

export function FaqForm({ mode, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = React.useState<AdminFaqInput>({
    question: initial?.question ?? '',
    answer: initial?.answer ?? '',
    category: initial?.category ?? 'genel',
    sortOrder: initial?.sortOrder ?? 0,
    isPublished: initial?.isPublished ?? true,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  function set<K extends keyof AdminFaqInput>(k: K, v: AdminFaqInput[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = adminFaqSchema.safeParse(form);
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
        ? await createFaqAction(r.data)
        : await updateFaqAction(initial!.id!, r.data);
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
    if (!confirm('Bu SSS girdisini silmek istediğinize emin misiniz?')) return;
    await deleteFaqAction(initial!.id!);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset className="glass space-y-4 rounded-2xl p-6">
        <legend className="font-display text-base font-semibold">SSS Bilgileri</legend>
        <Field label="Soru *" error={errors.question}>
          <textarea
            rows={2}
            maxLength={500}
            value={form.question}
            onChange={(e) => set('question', e.target.value)}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2"
          />
        </Field>
        <Field label="Cevap (markdown destekli) *" error={errors.answer}>
          <textarea
            rows={8}
            maxLength={8000}
            value={form.answer}
            onChange={(e) => set('answer', e.target.value)}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kategori *" error={errors.category}>
            <select
              value={form.category}
              onChange={(e) =>
                set('category', e.target.value as AdminFaqInput['category'])
              }
              className="h-11 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
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
