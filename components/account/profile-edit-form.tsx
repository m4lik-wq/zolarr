'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { profileEditSchema } from '@/lib/validation/auth-schema';
import { updateProfileAction } from '@/lib/auth/actions';

interface Props {
  initial: { name: string; phone: string };
}

export function ProfileEditForm({ initial }: Props) {
  const [form, setForm] = React.useState(initial);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = profileEditSchema.safeParse(form);
    if (!r.success) {
      const map: Record<string, string> = {};
      for (const issue of r.error.issues) map[issue.path[0] as string] = issue.message;
      setErrors(map);
      return;
    }
    setErrors({});
    setPending(true);
    const res = await updateProfileAction(r.data);
    setPending(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setErrors({ _form: res.error });
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      <div>
        <label htmlFor="p-name" className="text-sm font-medium">Ad Soyad</label>
        <Input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        {errors.name && <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="p-phone" className="text-sm font-medium">Telefon</label>
        <Input id="p-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+90..." />
        {errors.phone && <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.phone}</p>}
      </div>
      {errors._form && <p role="alert" className="text-sm text-[var(--color-danger)]">{errors._form}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>{pending ? 'Kaydediliyor…' : 'Kaydet'}</Button>
        {saved && <span className="text-sm text-[var(--color-brand)]">✓ Kaydedildi</span>}
      </div>
    </form>
  );
}
