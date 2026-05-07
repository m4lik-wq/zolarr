import { Fraunces, Manrope, JetBrains_Mono } from 'next/font/google';

export const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz', 'SOFT', 'WONK'],
});

export const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
});

export const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});
