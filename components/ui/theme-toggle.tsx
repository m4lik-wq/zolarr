'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from './button';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Button variant="icon" size="icon" aria-label="Tema yükleniyor" disabled />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="icon"
      size="icon"
      aria-label={isDark ? 'Aydınlık temaya geç' : 'Karanlık temaya geç'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
