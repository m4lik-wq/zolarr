'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supplierSchema, type SupplierInput } from '@/lib/validation/supplier-schema';
import {
  createSupplierAction,
  updateSupplierAction,
} from '@/lib/server-actions/admin/upsert-supplier';

interface AdapterOption {
  slug: string;
  displayName: string;
}

interface Props {
  mode: 'create' | 'edit';
  initial?: Partial<SupplierInput> & { id?: string };
  adapters: AdapterOption[];
}

export function SupplierForm({ mode, initial, adapters }: Props) {
  const router = useRouter();
  const [form, setForm] = React.useState<SupplierInput>({
    slug: initial?.slug ?? '',
    name: initial?.name ?? '',
    baseUrl: initial?.baseUrl ?? '',
    adapterSlug: initial?.adapterSlug ?? (adapters[0]?.slug ?? ''),
    enabled: initial?.enabled ?? true,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);

  function set<K extends keyof SupplierInput>(k: K, v: SupplierInput[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = supplierSchema.safeParse(form);
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
        ? await createSupplierAction(r.data)
        : await updateSupplierAction(initial!.id!, r.data);
    setPending(false);
    if (res && !res.ok) setErrors({ _form: res.error });
    else if (res && res.ok) router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset className="glass space-y-4 rounded-2xl p-6">
        <legend className="font-display text-base font-semibold">Tedarikçi Bilgileri</legend>
        <Field label="İsim *" error={errors.name}>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Slug *" error={errors.slug}>
          <Input
            value={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            placeholder="ornek-tedarikci"
          />
        </Field>
        <Field label="Adapter *" error={errors.adapterSlug}>
          <select
            value={form.adapterSlug}
            onChange={(e) => set('adapterSlug', e.target.value)}
            className="h-11 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4"
          >
            {adapters.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.displayName} ({a.slug})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Base URL" error={errors.baseUrl}>
          <Input
            value={form.baseUrl ?? ''}
            onChange={(e) => set('baseUrl', e.target.value)}
            placeholder="https://www.tedarikci-sitesi.com"
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => set('enabled', e.target.checked)}
            className="h-4 w-4 accent-[var(--color-brand)]"
          />
          Aktif (cron&apos;da otomatik sync edilsin)
        </label>
      </fieldset>

      {errors._form && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {errors._form}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Kaydediliyor…' : mode === 'create' ? 'Ekle' : 'Kaydet'}
        </Button>
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
