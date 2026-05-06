'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signInAction } from '@/lib/auth/actions';
import { loginSchema } from '@/lib/validation/auth-schema';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = React.useState({ email: '', password: '' });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = loginSchema.safeParse(form);
    if (!r.success) {
      const map: Record<string, string> = {};
      for (const issue of r.error.issues) map[issue.path[0] as string] = issue.message;
      setErrors(map);
      return;
    }
    setErrors({});
    setPending(true);
    const res = await signInAction(r.data);
    setPending(false);
    if (res.ok) {
      router.push(params.get('next') ?? '/hesap');
      router.refresh();
    } else {
      setErrors({ _form: res.error });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="text-sm font-medium">E-posta</label>
        <Input id="login-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
        {errors.email && <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="login-password" className="text-sm font-medium">Şifre</label>
        <Input id="login-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" />
        {errors.password && <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.password}</p>}
      </div>
      <div className="text-right">
        <Link href="/sifremi-unuttum" className="text-sm text-[var(--color-brand)] hover:underline">
          Şifremi unuttum
        </Link>
      </div>
      {errors._form && <p role="alert" className="text-sm text-[var(--color-danger)]">{errors._form}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Giriş yapılıyor…' : 'Giriş Yap'}
      </Button>
    </form>
  );
}
