'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { requestPasswordResetAction } from '@/lib/auth/actions';
import { resetRequestSchema } from '@/lib/validation/auth-schema';

export function PasswordResetRequestForm() {
  const [email, setEmail] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = resetRequestSchema.safeParse({ email });
    if (!r.success) {
      setErrorMsg(r.error.issues[0]?.message ?? 'Geçersiz e-posta');
      return;
    }
    setErrorMsg(null);
    setPending(true);
    const res = await requestPasswordResetAction(r.data);
    setPending(false);
    if (res.ok) setSent(true);
    else setErrorMsg(res.error);
  }

  if (sent) {
    return <p className="text-center text-sm">E-postanızı kontrol edin — sıfırlama bağlantısı gönderildi.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="reset-email" className="text-sm font-medium">E-posta</label>
        <Input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </div>
      {errorMsg && <p role="alert" className="text-sm text-[var(--color-danger)]">{errorMsg}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Gönderiliyor…' : 'Sıfırlama Bağlantısı Gönder'}
      </Button>
    </form>
  );
}
