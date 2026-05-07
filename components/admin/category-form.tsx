'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  adminCategorySchema,
  type AdminCategoryInput,
} from '@/lib/validation/admin-category-schema';
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from '@/lib/server-actions/admin/categories';
import type { Category } from '@/lib/db/types';

interface Props {
  mode: 'create' | 'edit';
  initial?: Partial<AdminCategoryInput> & { id?: string };
  parents: Category[];
}

export function CategoryForm({ mode, initial, parents }: Props) {
  const router = useRouter();
  const [form, setForm] = React.useState<AdminCategoryInput>({
    slug: initial?.slug ?? '',
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    parentId: initial?.parentId ?? null,
    icon: initial?.icon ?? '',
    sortOrder: initial?.sortOrder ?? 0,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);

  function set<K extends keyof AdminCategoryInput>(k: K, v: AdminCategoryInput[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = adminCategorySchema.safeParse(form);
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
    const res =
      mode === 'create'
        ? await createCategoryAction(r.data)
        : await updateCategoryAction(initial!.id!, r.data);
    setPending(false);
    if (res && !res.ok) setErrors({ _form: res.error });
    else if (res && res.ok) router.refresh();
  }

  async function onDelete() {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    await deleteCategoryAction(initial!.id!);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset className="glass space-y-4 rounded-2xl p-6">
        <legend className="font-display text-base font-semibold">Kategori Bilgileri</legend>
        <Field label="İsim *" error={errors.name}>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Slug *" error={errors.slug}>
          <Input
            value={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            placeholder="ornek-kategori"
          />
        </Field>
        <Field label="Açıklama" error={errors.description}>
          <textarea
            rows={4}
            value={form.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2"
          />
        </Field>
        <Field label="Üst kategori">
          <select
            value={form.parentId ?? ''}
            onChange={(e) => set('parentId', e.target.value || null)}
            className="h-11 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4"
          >
            <option value="">— Yok (Ana kategori) —</option>
            {parents
              .filter((p) => p.id !== initial?.id)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="İkon (lucide-react adı)">
            <Input
              value={form.icon ?? ''}
              onChange={(e) => set('icon', e.target.value)}
              placeholder="Sun"
            />
          </Field>
          <Field label="Sıralama" error={errors.sortOrder}>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => set('sortOrder', Number(e.target.value))}
            />
          </Field>
        </div>
      </fieldset>

      {errors._form && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {errors._form}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Kaydediliyor…' : mode === 'create' ? 'Ekle' : 'Kaydet'}
        </Button>
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
