'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useChatStore } from '@/lib/store/chat';

export function FloatingButton() {
  const { isOpen, toggle } = useChatStore();

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-label={isOpen ? 'AI asistanı kapat' : 'AI asistanı aç'}
      aria-expanded={isOpen}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: 'spring' }}
      className="fixed bottom-24 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand)] text-[var(--color-bg-base)] shadow-[var(--shadow-glow)] transition-transform hover:scale-110"
    >
      <Sparkles className="h-6 w-6" />
    </motion.button>
  );
}
