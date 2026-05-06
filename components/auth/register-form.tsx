'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUpAction } from '@/lib/auth/actions';
import { registerSchema } from '@/lib/validation/auth-schema';

export function RegisterForm() {
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    kvkkAccepted: false,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = registerSchema.safeParse(form);
    if (!r.success) {
      const map: Record<string, string> = {};
      for (const issue of r.error.issues) map[issue.path[0] as string] = issue.message;
      setErrors(map);
      return;
    }
    setErrors({});
    setPending(true);
    const res = await signUpAction(r.data);
    setPending(false);
    if (res.ok) setSuccess(true);
    else setErrors({ _form: res.error });
  }

  if (success) {
    return (
      <div className="text-center">
        <h3 className="font-display text-xl font-semibold">Kayıt başarılı!</h3>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          E-postanıza onay bağlantısı gönderildi. Bağlantıya tıkladıktan sonra giriş yapabilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field id="reg-name" label="Ad Soyad" error={errors.name}>
        <Input id="reg-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
      </Field>
      <Field id="reg-email" label="E-posta" error={errors.email}>
        <Input id="reg-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
      </Field>
      <Field id="reg-pw" label="Şifre" error={errors.password}>
        <Input id="reg-pw" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
      </Field>
      <Field id="reg-pw2" label="Şifre Tekrar" error={errors.passwordConfirm}>
        <Input id="reg-pw2" type="password" value={form.passwordConfirm} onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })} autoComplete="new-password" />
      </Field>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.kvkkAccepted}
          onChange={(e) => setForm({ ...form, kvkkAccepted: e.target.checked })}
          className="mt-1 h-4 w-4 accent-[var(--color-brand)]"
        />
        <span>KVKK aydınlatma metnini okudum ve verilerimin işlenmesine onay veriyorum. *</span>
      </label>
      {errors.kvkkAccepted && <p className="text-sm text-[var(--color-danger)]">{errors.kvkkAccepted}</p>}
      {errors._form && <p role="alert" className="text-sm text-[var(--color-danger)]">{errors._form}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Hesap oluşturuluyor…' : 'Kayıt Ol'}
      </Button>
    </form>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-sm text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}
