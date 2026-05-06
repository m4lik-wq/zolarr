'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updatePasswordAction } from '@/lib/auth/actions';
import { resetSchema } from '@/lib/validation/auth-schema';

export function PasswordResetForm() {
  const router = useRouter();
  const [form, setForm] = React.useState({ password: '', passwordConfirm: '' });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = resetSchema.safeParse(form);
    if (!r.success) {
      const map: Record<string, string> = {};
      for (const issue of r.error.issues) map[issue.path[0] as string] = issue.message;
      setErrors(map);
      return;
    }
    setErrors({});
    setPending(true);
    const res = await updatePasswordAction(r.data);
    setPending(false);
    if (res.ok) router.push('/hesap');
    else setErrors({ _form: res.error });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="new-pw" className="text-sm font-medium">Yeni Şifre</label>
        <Input id="new-pw" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
        {errors.password && <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.password}</p>}
      </div>
      <div>
        <label htmlFor="new-pw2" className="text-sm font-medium">Şifre Tekrar</label>
        <Input id="new-pw2" type="password" value={form.passwordConfirm} onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })} autoComplete="new-password" />
        {errors.passwordConfirm && <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.passwordConfirm}</p>}
      </div>
      {errors._form && <p role="alert" className="text-sm text-[var(--color-danger)]">{errors._form}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Kaydediliyor…' : 'Şifreyi Güncelle'}
      </Button>
    </form>
  );
}
