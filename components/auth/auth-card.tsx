import * as React from 'react';
import Link from 'next/link';

interface Props {
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, footer, children }: Props) {
  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <div className="glass rounded-2xl p-8 shadow-[var(--shadow-glass)]">
        <header className="mb-6 text-center">
          <Link href="/" className="font-display text-2xl font-bold text-[var(--color-brand)]">
            Zolarr
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-[var(--color-text-muted)]">{subtitle}</p>}
        </header>
        {children}
        {footer && <footer className="mt-6 border-t border-[var(--color-border-glass)] pt-4 text-center text-sm">{footer}</footer>}
      </div>
    </div>
  );
}
