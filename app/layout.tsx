import type { Metadata } from 'next';
import './globals.css';
import { fraunces, manrope, jetbrains } from '@/lib/design/fonts';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { CustomCursor } from '@/components/ui/cursor';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FloatingStack } from '@/components/layout/floating/floating-stack';

export const metadata: Metadata = {
  title: 'Zolarr — Güneşten Geleceğe',
  description: 'Türkiye\'nin güvenilir güneş enerjisi sistemleri firması.',
  metadataBase: new URL('https://zolarr.com.tr'),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${manrope.variable} ${jetbrains.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <CustomCursor />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingStack />
        </ThemeProvider>
      </body>
    </html>
  );
}
