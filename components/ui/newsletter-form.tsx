'use client';

import * as React from 'react';
import { Button } from './button';
import { Input } from './input';

interface Props {
  onSubscribe?: (email: string) => Promise<void>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm({ onSubscribe }: Props) {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!EMAIL_REGEX.test(email)) {
      setError('Geçerli bir e-posta giriniz.');
      return;
    }
    setPending(true);
    try {
      if (onSubscribe) await onSubscribe(email);
      setSuccess(true);
      setEmail('');
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <p className="text-sm text-[var(--color-brand)]">
        Aboneliğiniz alındı. Teşekkürler!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row" noValidate>
      <label className="sr-only" htmlFor="newsletter-email">
        E-posta
      </label>
      <Input
        id="newsletter-email"
        type="email"
        placeholder="ornek@firma.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!!error}
        disabled={pending}
        aria-invalid={!!error}
      />
      <Button type="submit" disabled={pending}>
        {pending ? 'Gönderiliyor…' : 'Abone ol'}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </form>
  );
}
