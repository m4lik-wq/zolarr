'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';

const STORAGE_KEY = 'zolarr-cookie-consent';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, date: new Date().toISOString() }));
    setShow(false);
  };

  const reject = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: false, date: new Date().toISOString() }));
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md bg-[var(--color-bg-elevated)]/95 border-t border-[var(--color-border-glass)] p-4 md:bottom-4 md:left-auto md:right-4 md:max-w-sm md:rounded-2xl md:border md:shadow-[var(--shadow-glass)]"
          role="dialog"
          aria-labelledby="cookie-title"
        >
          <h3 id="cookie-title" className="font-display font-semibold text-base mb-2">
            Çerez Bildirimi
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Sitemizde deneyiminizi geliştirmek için çerezler kullanıyoruz.{' '}
            <Link href="/cerez-politikasi" className="text-[var(--color-brand)] hover:underline">
              Detaylı bilgi
            </Link>
          </p>
          <div className="flex gap-2">
            <Button onClick={accept} size="sm" className="flex-1">Tümünü Kabul Et</Button>
            <Button onClick={reject} variant="secondary" size="sm" className="flex-1">Reddet</Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
