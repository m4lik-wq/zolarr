'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { contactSchema, type ContactInput } from '@/lib/validation/contact-schema';
import { submitContact } from '@/lib/server-actions/submit-contact';

type Form = Omit<ContactInput, 'kvkkAccepted'> & { kvkkAccepted: boolean };

const INITIAL: Form = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  body: '',
  kvkkAccepted: false,
};

export function ContactForm() {
  const [form, setForm] = React.useState<Form>(INITIAL);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);
  const [messageNumber, setMessageNumber] = React.useState<string | null>(null);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = contactSchema.safeParse(form);
    if (!r.success) {
      const map: Record<string, string> = {};
      for (const issue of r.error.issues) map[issue.path[0] as string] = issue.message;
      setErrors(map);
      return;
    }
    setErrors({});
    setPending(true);
    try {
      const res = await submitContact(r.data);
      if (res.ok) setMessageNumber(res.messageNumber);
      else setErrors({ _form: res.error });
    } catch {
      setErrors({ _form: 'Beklenmeyen bir hata oluştu, lütfen tekrar deneyin.' });
    } finally {
      setPending(false);
    }
  }

  if (messageNumber) {
    return (
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand)]/15"
        >
          <Check className="h-8 w-8 text-[var(--color-brand)]" strokeWidth={3} />
        </motion.div>
        <h3 className="mt-6 font-display text-2xl font-bold">Mesajınız iletildi!</h3>
        <p className="mt-2 text-[var(--color-text-muted)]">İletişim numaranız:</p>
        <p className="mt-3 rounded-2xl border border-[var(--color-brand)]/30 bg-[var(--color-bg-elevated)] px-5 py-2 font-mono text-lg text-[var(--color-brand)]">
          {messageNumber}
        </p>
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          2 iş günü içinde size dönüş yapılacak.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ad Soyad *" htmlFor="c-name" error={errors.name}>
          <Input
            id="c-name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </Field>
        <Field label="E-posta *" htmlFor="c-email" error={errors.email}>
          <Input
            id="c-email"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Telefon" htmlFor="c-phone" error={errors.phone}>
          <Input
            id="c-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+90..."
          />
        </Field>
        <Field label="Konu" htmlFor="c-subject" error={errors.subject}>
          <Input
            id="c-subject"
            value={form.subject}
            onChange={(e) => set('subject', e.target.value)}
          />
        </Field>
      </div>
      <Field label="Mesajınız *" htmlFor="c-body" error={errors.body}>
        <textarea
          id="c-body"
          rows={5}
          maxLength={4000}
          value={form.body}
          onChange={(e) => set('body', e.target.value)}
          className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
        />
      </Field>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.kvkkAccepted}
          onChange={(e) => set('kvkkAccepted', e.target.checked)}
          className="mt-1 h-4 w-4 accent-[var(--color-brand)]"
        />
        <span>
          KVKK aydınlatma metnini okudum ve verilerimin iletişim amacıyla işlenmesine onay
          veriyorum. *
        </span>
      </label>
      {errors.kvkkAccepted && (
        <p className="text-sm text-[var(--color-danger)]">{errors.kvkkAccepted}</p>
      )}
      {errors._form && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {errors._form}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? 'Gönderiliyor…' : 'Gönder'}
      </Button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-sm text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}
