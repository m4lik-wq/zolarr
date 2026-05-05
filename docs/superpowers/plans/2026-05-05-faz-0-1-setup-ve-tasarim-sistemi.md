# Zolarr Faz 0+1 Implementation Plan: Setup ve Tasarım Sistemi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next.js 15 + Tailwind 4 + Supabase tabanlı projeyi kurmak; Cyber Lime + Glassmorphism tasarım sistemini kurmak; Header/Footer/Cursor/Floating bileşenlerini test'li olarak tamamlamak ve çalışan bir shell teslim etmek.

**Architecture:** Next.js 15 App Router, TypeScript strict, Tailwind CSS 4 (CSS-first config), shadcn/ui pattern (kopya bileşenler), next-themes ile dark/light, Vitest + React Testing Library ile component testleri, Supabase + Drizzle ORM hazırlığı.

**Tech Stack:** Next.js 15.x, React 19, TypeScript 5.x, Tailwind CSS 4.x, shadcn/ui pattern, Framer Motion 11.x, next-themes 0.3.x, Lucide React, Supabase JS, Drizzle ORM, Vitest 2.x, React Testing Library, Playwright (manuel E2E için).

**Spec referansı:** `docs/superpowers/specs/2026-05-05-zolarr-website-design.md` — Bölüm 2 (Faz 0+1), Bölüm 4 (Tasarım Sistemi)

**Çalışma dizini:** `C:\zolarr` (proje kökü)

---

## File Structure (Bu Planda Oluşturulacak/Değişecek Dosyalar)

```
C:\zolarr\
├── app/
│   ├── layout.tsx                       # Root layout (provider'lar, font, header, footer)
│   ├── page.tsx                         # Geçici anasayfa (Faz 2'de gerçek)
│   ├── not-found.tsx                    # 404
│   └── globals.css                      # Tailwind + design tokens (CSS variables)
├── components/
│   ├── ui/
│   │   ├── button.tsx                   # Primary/Secondary/Icon/Ghost variants
│   │   ├── button.test.tsx
│   │   ├── card.tsx                     # Glass card, kart varyantları
│   │   ├── card.test.tsx
│   │   ├── input.tsx                    # Form input
│   │   ├── input.test.tsx
│   │   ├── logo.tsx                     # SVG logo + Zolarr metni
│   │   ├── logo.test.tsx
│   │   ├── cursor.tsx                   # Mouse takip imleç + tıklama dalga
│   │   ├── theme-toggle.tsx             # Dark/Light/System
│   │   ├── theme-toggle.test.tsx
│   │   ├── cookie-banner.tsx            # KVKK çerez bildirimi
│   │   └── toaster.tsx                  # Toast bildirimleri (sonner)
│   ├── layout/
│   │   ├── header.tsx                   # Sticky header
│   │   ├── header.test.tsx
│   │   ├── footer.tsx                   # 4 sütunlu footer
│   │   ├── footer.test.tsx
│   │   ├── mobile-menu.tsx              # Sağdan kayan drawer
│   │   └── floating/
│   │       ├── whatsapp-button.tsx
│   │       ├── mobile-cta.tsx           # Mobil alt sticky bar
│   │       └── floating-stack.tsx       # Tüm floating'ları yöneten container
│   └── providers/
│       ├── theme-provider.tsx
│       └── query-provider.tsx           # TanStack Query
├── lib/
│   ├── utils.ts                         # cn() helper (clsx + tailwind-merge)
│   ├── constants.ts                     # Hesaplama sabitleri, navigasyon
│   ├── db/
│   │   ├── index.ts                     # Drizzle client
│   │   └── schema.ts                    # İlk şema (users, site_settings)
│   └── supabase/
│       ├── client.ts                    # Browser client
│       └── server.ts                    # Server client
├── public/
│   ├── logo.svg                         # Logo (webp'den dönüştürülecek)
│   ├── logo-light.svg
│   └── favicon.ico
├── tests/
│   └── setup.ts                         # Vitest setup
├── .env.local                           # Yerel env (commit edilmez)
├── .env.example                         # Şablon env
├── .gitignore
├── next.config.ts
├── tsconfig.json
├── vitest.config.ts
├── drizzle.config.ts
├── package.json
└── README.md
```

---

## Task 1: Next.js 15 Projesini Başlat

**Files:**
- Create: tüm proje skeleton (Next.js otomatik üretir)
- Modify: `package.json`, `tsconfig.json`

- [ ] **Step 1.1: Next.js init komutunu çalıştır**

Çalışma dizini `C:\zolarr` boş olmadığı için (referans görseller var), Next.js'i mevcut dizine kuracağız. Önce referans görselleri `assets/refs/` altına taşıyalım.

```powershell
cd C:\zolarr
mkdir assets\refs
move "logo.webp" "assets\refs\logo.webp"
move "design_Black & Green Color Palette _.webp" "assets\refs\palette.webp"
move "Modern, Minimal buton Tailored for Your #Business _ 𝐂𝐡𝐞𝐜𝐤 𝐁𝐢𝐨.webp" "assets\refs\buttons.webp"
move "ürün görsel referans tasarım.jpg" "assets\refs\product-style.jpg"
```

- [ ] **Step 1.2: Next.js'i mevcut dizine kur**

```powershell
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --turbopack --import-alias="@/*" --eslint --no-experimental-app
```

Sorulara cevaplar:
- TypeScript: Yes
- ESLint: Yes
- Tailwind: Yes
- `src/` dizini: No
- App Router: Yes
- Turbopack: Yes
- Import alias: `@/*`

Beklenen çıktı: Next.js 15.x kurulu, `app/`, `public/`, `package.json`, `next.config.ts`, `tsconfig.json` oluşmuş.

- [ ] **Step 1.3: TypeScript strict mode'u kontrol et**

`tsconfig.json` aşağıdaki alanları içermeli (eksikleri ekle):

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true,
    "target": "ES2022"
  }
}
```

- [ ] **Step 1.4: Geçici doğrulama**

```powershell
npm run dev
```

Beklenen: `http://localhost:3000` üzerinde Next.js karşılama sayfası açılır. Ctrl+C ile durdur.

- [ ] **Step 1.5: Git init ve ilk commit**

```powershell
git init
git add -A
git commit -m "chore: bootstrap Next.js 15 project with TypeScript and Tailwind"
```

---

## Task 2: Geliştirme Bağımlılıklarını Kur

**Files:**
- Modify: `package.json`

- [ ] **Step 2.1: Runtime kütüphaneleri kur**

```powershell
npm install framer-motion@^11 next-themes@^0.3 lucide-react clsx tailwind-merge class-variance-authority @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-accordion @radix-ui/react-toast sonner zod react-hook-form @hookform/resolvers zustand @tanstack/react-query embla-carousel-react react-markdown remark-gfm rehype-raw
```

- [ ] **Step 2.2: Backend hazırlık kütüphaneleri kur**

```powershell
npm install @supabase/supabase-js @supabase/ssr drizzle-orm postgres
npm install -D drizzle-kit
```

- [ ] **Step 2.3: Test kütüphanelerini kur**

```powershell
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @types/node
```

- [ ] **Step 2.4: package.json scripts ekle**

`package.json` "scripts" bölümünü güncelle:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push"
  }
}
```

- [ ] **Step 2.5: Commit**

```powershell
git add package.json package-lock.json
git commit -m "chore: install core runtime, backend, and test dependencies"
```

---

## Task 3: Vitest + React Testing Library Kurulumu

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`

- [ ] **Step 3.1: vitest.config.ts oluştur**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 3.2: tests/setup.ts oluştur**

```typescript
// tests/setup.ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// JSDOM matchMedia mock (next-themes ihtiyaç duyar)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
```

- [ ] **Step 3.3: Smoke test yaz**

```typescript
// tests/smoke.test.ts
import { describe, it, expect } from 'vitest';

describe('test setup', () => {
  it('vitest çalışıyor', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 3.4: Test'leri çalıştır**

```powershell
npm test -- --run
```

Beklenen: 1 test geçer.

- [ ] **Step 3.5: Commit**

```powershell
git add vitest.config.ts tests/
git commit -m "chore: configure Vitest and React Testing Library"
```

---

## Task 4: Tailwind CSS 4 + Design Token'lar

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 4.1: globals.css'i tamamen değiştir**

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Renk token'ları - dark mode varsayılan */
  --color-bg-base: #0F0F0F;
  --color-bg-elevated: #202020;
  --color-bg-overlay: #2A2A2A;
  --color-bg-glass: rgba(20, 20, 20, 0.6);
  --color-border: #2F2F2F;
  --color-border-glass: rgba(255, 255, 255, 0.1);
  --color-text-primary: #F8F8F8;
  --color-text-muted: #A0A0A0;
  --color-brand: #5DD62C;
  --color-brand-dark: #337418;
  --color-brand-glow: rgba(93, 214, 44, 0.40);
  --color-brand-neon: #B6F36C;
  --color-success: #5DD62C;
  --color-warning: #F4B400;
  --color-danger: #E94B4B;
  --color-info: #4B9BE9;

  /* Tipografi */
  --font-display: "Space Grotesk", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* Border radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  /* Shadow */
  --shadow-glow: 0 0 24px rgba(93, 214, 44, 0.4);
  --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Light mode override */
:root[data-theme="light"] {
  --color-bg-base: #F8F8F8;
  --color-bg-elevated: #FFFFFF;
  --color-bg-overlay: #F0F0F0;
  --color-bg-glass: rgba(255, 255, 255, 0.7);
  --color-border: #E5E5E5;
  --color-border-glass: rgba(0, 0, 0, 0.08);
  --color-text-primary: #0F0F0F;
  --color-text-muted: #555555;
  --color-brand: #2D6912;
  --color-brand-dark: #5DD62C;
  --color-brand-glow: rgba(45, 105, 18, 0.25);
}

@layer base {
  * {
    border-color: var(--color-border);
  }
  body {
    background-color: var(--color-bg-base);
    color: var(--color-text-primary);
    font-family: var(--font-body);
    transition: background-color 200ms ease, color 200ms ease;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
  }
}

@layer utilities {
  .glass {
    backdrop-filter: blur(16px);
    background-color: var(--color-bg-glass);
    border: 1px solid var(--color-border-glass);
  }
  .glow {
    box-shadow: var(--shadow-glow);
  }
  /* Custom cursor için default cursor'u gizle (sadece desktop) */
  @media (pointer: fine) and (hover: hover) {
    body.has-custom-cursor,
    body.has-custom-cursor * {
      cursor: none !important;
    }
  }
}

/* prefers-reduced-motion: animasyonları azalt */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4.2: Geçici test - dev server'ı başlat**

```powershell
npm run dev
```

Tarayıcıda `http://localhost:3000` aç — sayfa siyah arka plan + beyaz metin görünmeli. Ctrl+C ile durdur.

- [ ] **Step 4.3: Commit**

```powershell
git add app/globals.css
git commit -m "feat(design): configure Tailwind 4 design tokens (Cyber Lime + Glassmorphism)"
```

---

## Task 5: Font'ları Yükle (Space Grotesk + Inter + JetBrains Mono)

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 5.1: app/layout.tsx'i güncelle**

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Zolarr — Güneşten Geleceğe',
  description: 'Türkiye\'nin güvenilir güneş enerjisi sistemleri firması.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 5.2: Commit**

```powershell
git add app/layout.tsx
git commit -m "feat(fonts): load Space Grotesk, Inter, JetBrains Mono with Latin Extended"
```

---

## Task 6: utils.ts ve constants.ts

**Files:**
- Create: `lib/utils.ts`
- Create: `lib/constants.ts`

- [ ] **Step 6.1: lib/utils.ts oluştur**

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 6.2: lib/constants.ts oluştur**

```typescript
// lib/constants.ts

export const SITE = {
  name: 'Zolarr',
  tagline: 'Güneşten Geleceğe',
  description: 'Türkiye\'nin güvenilir güneş enerjisi sistemleri firması.',
} as const;

export const NAV_LINKS = [
  { href: '/', label: 'Anasayfa' },
  { href: '/magaza', label: 'E-Mağaza' },
  { href: '/teklif', label: 'Teklif Al/Ver' },
  { href: '/galeri', label: 'Galeri & Projeler' },
  { href: '/hakkimizda', label: 'Hakkımızda' },
] as const;

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/zolarrenerji',
  linkedin: 'https://linkedin.com/company/zolarr',
  twitter: 'https://x.com/zolarr',
  youtube: 'https://youtube.com/@zolarrenerji',
  tiktok: 'https://tiktok.com/@zolarr',
  facebook: 'https://facebook.com/zolarrenerji',
} as const;

// Şablon iletişim — sonradan site_settings DB'den okunacak
export const CONTACT = {
  address: 'Örnek Mah. Güneş Sok. No:42 Beşiktaş/İstanbul',
  phone: '+90 (212) 555 0 555',
  whatsapp: '+905555555555',
  email: 'info@zolarr.com.tr',
} as const;

// Hesaplama sabitleri (Spec Bölüm 15)
export const CALC = {
  ELECTRICITY_UNIT_PRICE: 3.20,   // TL/kWh
  SYSTEM_EFFICIENCY: 0.85,         // verim katsayısı
  SYSTEM_COST_PER_KWP: 14000,      // TL/kWp
  INFLATION_FACTOR: 1.05,
} as const;
```

- [ ] **Step 6.3: Commit**

```powershell
git add lib/
git commit -m "feat(lib): add cn() helper and site constants"
```

---

## Task 7: Logo Bileşeni (TDD)

**Files:**
- Create: `components/ui/logo.tsx`
- Create: `components/ui/logo.test.tsx`
- Create: `public/logo.svg` (manuel — webp'den dönüştürülmüş)

- [ ] **Step 7.1: Logo'yu SVG'ye dönüştür**

`assets/refs/logo.webp` dosyasını çevrimiçi bir araç ile (örn. https://convertio.co/webp-svg/) SVG'ye çevir. Çıkan dosyayı `public/logo.svg` olarak kaydet. SVG path'lerinin `fill="currentColor"` kullanmasını sağla (renk dinamik olsun).

Eğer dönüşüm zor olursa, geçici olarak şu placeholder SVG'yi kullan:

```svg
<!-- public/logo.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor">
  <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" stroke-width="3"/>
  <g>
    <path d="M50 10 L52 25 L48 25 Z M50 90 L52 75 L48 75 Z M10 50 L25 52 L25 48 Z M90 50 L75 52 L75 48 Z"/>
    <path d="M21 21 L31 30 L30 31 Z M79 21 L70 31 L69 30 Z M21 79 L31 70 L30 69 Z M79 79 L69 70 L70 69 Z"/>
  </g>
  <path d="M55 38 A 12 12 0 1 0 55 62 A 9 9 0 0 1 55 38 Z" fill="currentColor"/>
</svg>
```

- [ ] **Step 7.2: Logo test'i yaz**

```typescript
// components/ui/logo.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from './logo';

describe('Logo', () => {
  it('Zolarr metnini gösterir', () => {
    render(<Logo />);
    expect(screen.getByText('Zolarr')).toBeInTheDocument();
  });

  it('aria-label ile erişilebilir', () => {
    render(<Logo />);
    expect(screen.getByRole('img', { name: /zolarr logo/i })).toBeInTheDocument();
  });

  it('showText=false ile metin gizlenebilir', () => {
    render(<Logo showText={false} />);
    expect(screen.queryByText('Zolarr')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 7.3: Test'i çalıştır - başarısız olmalı**

```powershell
npm test -- --run components/ui/logo.test.tsx
```

Beklenen: FAIL — `Cannot find module './logo'`

- [ ] **Step 7.4: Logo bileşenini yaz**

```typescript
// components/ui/logo.tsx
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  showText?: boolean;
  size?: number;
  className?: string;
}

export function Logo({ showText = true, size = 32, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Image
        src="/logo.svg"
        alt="Zolarr Logo"
        width={size}
        height={size}
        priority
        role="img"
      />
      {showText && (
        <span className="font-display font-bold text-xl tracking-tight">
          Zolarr
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 7.5: Test'i tekrar çalıştır - geçmeli**

```powershell
npm test -- --run components/ui/logo.test.tsx
```

Beklenen: PASS (3 test).

- [ ] **Step 7.6: Commit**

```powershell
git add components/ui/logo.tsx components/ui/logo.test.tsx public/logo.svg
git commit -m "feat(ui): add Logo component with text and SVG"
```

---

## Task 8: Button Bileşeni (TDD)

**Files:**
- Create: `components/ui/button.tsx`
- Create: `components/ui/button.test.tsx`

- [ ] **Step 8.1: Button test'i yaz**

```typescript
// components/ui/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('children içeriğini gösterir', () => {
    render(<Button>Tıkla</Button>);
    expect(screen.getByRole('button', { name: 'Tıkla' })).toBeInTheDocument();
  });

  it('onClick callback çağrılır', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Tıkla</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled iken tıklanamaz', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Tıkla</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('primary variant brand rengini uygular', () => {
    render(<Button variant="primary">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass(/brand/);
  });

  it('secondary variant glass efekti uygular', () => {
    render(<Button variant="secondary">Test</Button>);
    expect(screen.getByRole('button').className).toContain('glass');
  });

  it('asChild ile başka bir element olarak render eder', () => {
    render(<Button asChild><a href="/test">Link</a></Button>);
    expect(screen.getByRole('link')).toBeInTheDocument();
  });
});
```

- [ ] **Step 8.2: Test'i çalıştır - başarısız olmalı**

```powershell
npm test -- --run components/ui/button.test.tsx
```

Beklenen: FAIL.

- [ ] **Step 8.3: Button bileşenini yaz**

```typescript
// components/ui/button.tsx
'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--color-brand)] text-[var(--color-bg-base)] hover:bg-[var(--color-brand-dark)] hover:shadow-[var(--shadow-glow)]',
        secondary: 'glass text-[var(--color-brand)] hover:border-[var(--color-brand)]',
        ghost: 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-overlay)]',
        destructive: 'bg-[var(--color-danger)] text-white hover:opacity-90',
        icon: 'glass aspect-square justify-center hover:bg-[var(--color-bg-overlay)]',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { buttonVariants };
```

- [ ] **Step 8.4: Test'i tekrar çalıştır - geçmeli**

```powershell
npm test -- --run components/ui/button.test.tsx
```

Beklenen: PASS (6 test).

- [ ] **Step 8.5: Commit**

```powershell
git add components/ui/button.tsx components/ui/button.test.tsx
git commit -m "feat(ui): add Button component with variants (primary, secondary, ghost, destructive, icon)"
```

---

## Task 9: Card Bileşeni (TDD)

**Files:**
- Create: `components/ui/card.tsx`
- Create: `components/ui/card.test.tsx`

- [ ] **Step 9.1: Card test'i yaz**

```typescript
// components/ui/card.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

describe('Card', () => {
  it('children'i render eder', () => {
    render(<Card>İçerik</Card>);
    expect(screen.getByText('İçerik')).toBeInTheDocument();
  });

  it('default olarak glass class uygular', () => {
    const { container } = render(<Card>Test</Card>);
    expect(container.firstChild).toHaveClass('glass');
  });

  it('variant=elevated ile elevated arka plan kullanır', () => {
    const { container } = render(<Card variant="elevated">Test</Card>);
    expect(container.firstChild).not.toHaveClass('glass');
  });

  it('CardHeader, CardTitle, CardContent, CardFooter alt bileşenler render eder', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Başlık</CardTitle>
          <CardDescription>Açıklama</CardDescription>
        </CardHeader>
        <CardContent>İçerik</CardContent>
        <CardFooter>Alt</CardFooter>
      </Card>
    );
    expect(screen.getByText('Başlık')).toBeInTheDocument();
    expect(screen.getByText('Açıklama')).toBeInTheDocument();
    expect(screen.getByText('İçerik')).toBeInTheDocument();
    expect(screen.getByText('Alt')).toBeInTheDocument();
  });
});
```

- [ ] **Step 9.2: Test'i çalıştır - başarısız olmalı**

```powershell
npm test -- --run components/ui/card.test.tsx
```

- [ ] **Step 9.3: Card bileşenini yaz**

```typescript
// components/ui/card.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'elevated';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl p-6 transition-all duration-300',
        variant === 'glass' && 'glass hover:border-[var(--color-brand)]/30',
        variant === 'elevated' && 'bg-[var(--color-bg-elevated)] border border-[var(--color-border)]',
        'hover:-translate-y-0.5',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4 space-y-1', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('font-display text-xl font-semibold', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-[var(--color-text-muted)]', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-4 flex items-center', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';
```

- [ ] **Step 9.4: Test'i tekrar çalıştır - geçmeli**

```powershell
npm test -- --run components/ui/card.test.tsx
```

- [ ] **Step 9.5: Commit**

```powershell
git add components/ui/card.tsx components/ui/card.test.tsx
git commit -m "feat(ui): add Card component with glass and elevated variants"
```

---

## Task 10: Input Bileşeni (TDD)

**Files:**
- Create: `components/ui/input.tsx`
- Create: `components/ui/input.test.tsx`

- [ ] **Step 10.1: Test yaz**

```typescript
// components/ui/input.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input', () => {
  it('placeholder gösterir', () => {
    render(<Input placeholder="Adınız" />);
    expect(screen.getByPlaceholderText('Adınız')).toBeInTheDocument();
  });

  it('kullanıcı yazdığında değer güncellenir', async () => {
    render(<Input placeholder="Test" />);
    const input = screen.getByPlaceholderText('Test') as HTMLInputElement;
    await userEvent.type(input, 'Mehmet');
    expect(input.value).toBe('Mehmet');
  });

  it('disabled iken yazılamaz', async () => {
    render(<Input placeholder="Test" disabled />);
    const input = screen.getByPlaceholderText('Test') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it('error prop hata stilini uygular', () => {
    render(<Input placeholder="Test" error />);
    expect(screen.getByPlaceholderText('Test').className).toMatch(/danger/);
  });
});
```

- [ ] **Step 10.2: Input bileşenini yaz**

```typescript
// components/ui/input.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-2xl border bg-[var(--color-bg-elevated)] px-4 py-2 text-base',
        'placeholder:text-[var(--color-text-muted)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-colors',
        error
          ? 'border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]'
          : 'border-[var(--color-border)]',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
```

- [ ] **Step 10.3: Test'i çalıştır - geçmeli**

```powershell
npm test -- --run components/ui/input.test.tsx
```

- [ ] **Step 10.4: Commit**

```powershell
git add components/ui/input.tsx components/ui/input.test.tsx
git commit -m "feat(ui): add Input component with error state"
```

---

## Task 11: Theme Provider ve Theme Toggle

**Files:**
- Create: `components/providers/theme-provider.tsx`
- Create: `components/ui/theme-toggle.tsx`
- Create: `components/ui/theme-toggle.test.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 11.1: Theme provider yaz**

```typescript
// components/providers/theme-provider.tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps } from 'react';

export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
```

- [ ] **Step 11.2: ThemeToggle test'i yaz**

```typescript
// components/ui/theme-toggle.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
  it('toggle butonunu render eder', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    expect(screen.getByRole('button', { name: /tema/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 11.3: ThemeToggle bileşenini yaz**

```typescript
// components/ui/theme-toggle.tsx
'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from './button';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
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
```

- [ ] **Step 11.4: Test'i çalıştır**

```powershell
npm test -- --run components/ui/theme-toggle.test.tsx
```

- [ ] **Step 11.5: layout.tsx'e ThemeProvider'ı entegre et**

```typescript
// app/layout.tsx (mevcut dosyayı güncelle - body kısmı)
import { ThemeProvider } from '@/components/providers/theme-provider';

// ... fontlar aynı ...

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 11.6: Commit**

```powershell
git add components/providers/theme-provider.tsx components/ui/theme-toggle.tsx components/ui/theme-toggle.test.tsx app/layout.tsx
git commit -m "feat(theme): add ThemeProvider and ThemeToggle (next-themes integration)"
```

---

## Task 12: Custom Cursor Bileşeni

**Files:**
- Create: `components/ui/cursor.tsx`

(Cursor bileşeni gerçek mouse takibi gerektirdiği için unit test yerine manuel/E2E test yapılacak.)

- [ ] **Step 12.1: Cursor bileşenini yaz**

```typescript
// components/ui/cursor.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Mobile/touch device kontrolü - kapat
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const reducesMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || reducesMotion) return;

    document.body.classList.add('has-custom-cursor');

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement;
      const isClickable = !!target.closest('a, button, [role="button"], input, textarea, select');
      setIsPointer(isClickable);
    };

    const onClick = (e: MouseEvent) => {
      const id = Date.now();
      setRipples((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 800);
    };

    const onLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('click', onClick);
    document.addEventListener('mouseleave', onLeave);

    let raf: number;
    const animate = () => {
      // Lerp ring towards mouse position
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.18;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x - 16}px, ${ringPos.current.y - 16}px, 0)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x - 3}px, ${pos.current.y - 3}px, 0)`;
      }
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
      document.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
      document.body.classList.remove('has-custom-cursor');
    };
  }, [isVisible]);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true">
      <div
        ref={ringRef}
        className="absolute h-8 w-8 rounded-full border-2 border-[var(--color-brand)] transition-transform duration-150"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isPointer ? 'scale(1.75)' : 'scale(1)',
          willChange: 'transform',
        }}
      />
      <div
        ref={dotRef}
        className="absolute h-1.5 w-1.5 rounded-full bg-[var(--color-brand)]"
        style={{ opacity: isVisible ? 1 : 0, willChange: 'transform' }}
      />
      {ripples.map((r) => (
        <motion.div
          key={r.id}
          className="absolute h-20 w-20 rounded-full border-2 border-[var(--color-brand)]"
          style={{ left: r.x - 40, top: r.y - 40 }}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 12.2: Layout'a cursor'u ekle**

`app/layout.tsx`'i güncelle: `<ThemeProvider>` içine `<CustomCursor />` ekle (children'dan önce).

```typescript
// app/layout.tsx (sadece ThemeProvider içeriği değişiyor)
import { CustomCursor } from '@/components/ui/cursor';

// body içinde:
<ThemeProvider>
  <CustomCursor />
  {children}
</ThemeProvider>
```

- [ ] **Step 12.3: Manuel test**

```powershell
npm run dev
```

Tarayıcıda `http://localhost:3000` aç. Mouse'u hareket ettir → yeşil halka takip etmeli. Bir butona/linke yaklaş → halka büyümeli. Tıkla → dalga efekti. Mobile (DevTools toggle) → cursor görünmemeli.

- [ ] **Step 12.4: Commit**

```powershell
git add components/ui/cursor.tsx app/layout.tsx
git commit -m "feat(ui): add CustomCursor with mouse tracking, hover detection, and click ripple"
```

---

## Task 13: Header Bileşeni

**Files:**
- Create: `components/layout/header.tsx`
- Create: `components/layout/header.test.tsx`
- Create: `components/layout/mobile-menu.tsx`

- [ ] **Step 13.1: Header test'i yaz**

```typescript
// components/layout/header.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Header } from './header';
import { NAV_LINKS } from '@/lib/constants';

describe('Header', () => {
  function renderWithProvider(ui: React.ReactElement) {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
  }

  it('logo gösterir', () => {
    renderWithProvider(<Header />);
    expect(screen.getByText('Zolarr')).toBeInTheDocument();
  });

  it('tüm navigasyon bağlantılarını gösterir (desktop)', () => {
    renderWithProvider(<Header />);
    NAV_LINKS.forEach((link) => {
      const elements = screen.getAllByText(link.label);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('tema değiştirici butonu gösterir', () => {
    renderWithProvider(<Header />);
    expect(screen.getByRole('button', { name: /tema/i })).toBeInTheDocument();
  });

  it('sepet ikonu gösterir', () => {
    renderWithProvider(<Header />);
    expect(screen.getByRole('link', { name: /sepet/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 13.2: MobileMenu yaz**

```typescript
// components/layout/mobile-menu.tsx
'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { NAV_LINKS } from '@/lib/constants';

export function MobileMenu() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="icon" size="icon" aria-label="Menüyü aç" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className="fixed right-0 top-0 z-50 h-full w-[85vw] max-w-sm glass border-l border-[var(--color-border-glass)] p-6 data-[state=open]:animate-in data-[state=open]:slide-in-from-right"
        >
          <div className="flex items-center justify-between mb-8">
            <Dialog.Title className="font-display font-semibold text-lg">Menü</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="icon" size="icon" aria-label="Kapat">
                <X className="h-5 w-5" />
              </Button>
            </Dialog.Close>
          </div>
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Dialog.Close asChild key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-2xl px-4 py-3 text-lg hover:bg-[var(--color-bg-overlay)] transition-colors"
                >
                  {link.label}
                </Link>
              </Dialog.Close>
            ))}
          </nav>
          <div className="mt-8 flex items-center gap-2">
            <ThemeToggle />
            <span className="text-sm text-[var(--color-text-muted)]">Tema</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

- [ ] **Step 13.3: Header bileşenini yaz**

```typescript
// components/layout/header.tsx
'use client';

import Link from 'next/link';
import { ShoppingCart, User, Search } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { MobileMenu } from './mobile-menu';
import { NAV_LINKS } from '@/lib/constants';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 w-full transition-all duration-300',
        scrolled ? 'glass border-b border-[var(--color-border-glass)]' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20 md:px-6">
        <Link href="/" aria-label="Zolarr Anasayfa">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-4 py-2 text-sm font-medium hover:bg-[var(--color-bg-overlay)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="icon" size="icon" aria-label="Ara" className="hidden md:inline-flex">
            <Search className="h-5 w-5" />
          </Button>
          <div className="hidden md:inline-flex">
            <ThemeToggle />
          </div>
          <Link href="/giris" aria-label="Hesabım" className="hidden md:inline-flex">
            <Button variant="icon" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/sepet" aria-label="Sepetim">
            <Button variant="icon" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 13.4: Test'i çalıştır**

```powershell
npm test -- --run components/layout/header.test.tsx
```

Beklenen: PASS.

- [ ] **Step 13.5: Commit**

```powershell
git add components/layout/
git commit -m "feat(layout): add Header with sticky scroll glass effect and MobileMenu drawer"
```

---

## Task 14: Footer Bileşeni

**Files:**
- Create: `components/layout/footer.tsx`
- Create: `components/layout/footer.test.tsx`

- [ ] **Step 14.1: Footer test'i yaz**

```typescript
// components/layout/footer.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './footer';

describe('Footer', () => {
  it('Zolarr metni footer\'da görünür', () => {
    render(<Footer />);
    expect(screen.getAllByText(/zolarr/i).length).toBeGreaterThan(0);
  });

  it('telif hakkı bilgisi gösterir', () => {
    render(<Footer />);
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('sosyal medya bağlantıları içerir', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument();
  });

  it('iletişim bilgilerini gösterir', () => {
    render(<Footer />);
    expect(screen.getByText(/info@zolarr/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 14.2: Footer bileşenini yaz**

```typescript
// components/layout/footer.tsx
import Link from 'next/link';
import { Instagram, Linkedin, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SITE, SOCIAL_LINKS, CONTACT } from '@/lib/constants';

const QUICK_LINKS = [
  { href: '/', label: 'Anasayfa' },
  { href: '/magaza', label: 'E-Mağaza' },
  { href: '/teklif/al', label: 'Teklif Al' },
  { href: '/galeri', label: 'Galeri & Projeler' },
  { href: '/hakkimizda', label: 'Hakkımızda' },
  { href: '/iletisim', label: 'İletişim' },
];

const LEGAL_LINKS = [
  { href: '/kvkk', label: 'KVKK' },
  { href: '/gizlilik', label: 'Gizlilik Politikası' },
  { href: '/cerez-politikasi', label: 'Çerez Politikası' },
  { href: '/mesafeli-satis', label: 'Mesafeli Satış' },
  { href: '/sss', label: 'SSS' },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <Logo size={40} />
            <p className="mt-4 text-sm text-[var(--color-text-muted)]">
              {SITE.tagline}. Türkiye'nin güvenilir güneş enerjisi sistemleri firması.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <Link href={SOCIAL_LINKS.instagram} aria-label="Instagram" target="_blank" rel="noopener">
                <Button variant="icon" size="icon"><Instagram className="h-4 w-4" /></Button>
              </Link>
              <Link href={SOCIAL_LINKS.linkedin} aria-label="LinkedIn" target="_blank" rel="noopener">
                <Button variant="icon" size="icon"><Linkedin className="h-4 w-4" /></Button>
              </Link>
              <Link href={SOCIAL_LINKS.twitter} aria-label="X (Twitter)" target="_blank" rel="noopener">
                <Button variant="icon" size="icon"><Twitter className="h-4 w-4" /></Button>
              </Link>
              <Link href={SOCIAL_LINKS.youtube} aria-label="YouTube" target="_blank" rel="noopener">
                <Button variant="icon" size="icon"><Youtube className="h-4 w-4" /></Button>
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-base mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-base mb-4">Yasal</h4>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-base mb-4">İletişim</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-[var(--color-text-muted)]">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{CONTACT.address}</span>
              </li>
              <li className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <Phone className="h-4 w-4 shrink-0" />
                <a href={`tel:${CONTACT.phone}`} className="hover:text-[var(--color-brand)]">{CONTACT.phone}</a>
              </li>
              <li className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <Mail className="h-4 w-4 shrink-0" />
                <a href={`mailto:${CONTACT.email}`} className="hover:text-[var(--color-brand)]">{CONTACT.email}</a>
              </li>
            </ul>
            <form className="mt-6" onSubmit={(e) => e.preventDefault()}>
              <label className="block text-sm font-medium mb-2">Bültene Kayıt</label>
              <div className="flex gap-2">
                <Input type="email" placeholder="E-posta" className="flex-1" />
                <Button type="submit" size="md">Kayıt</Button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--color-border)] pt-6 text-center text-sm text-[var(--color-text-muted)]">
          © 2026 Zolarr. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 14.3: Test'i çalıştır**

```powershell
npm test -- --run components/layout/footer.test.tsx
```

- [ ] **Step 14.4: Commit**

```powershell
git add components/layout/footer.tsx components/layout/footer.test.tsx
git commit -m "feat(layout): add Footer with 4-column layout and newsletter form"
```

---

## Task 15: WhatsApp Floating Button

**Files:**
- Create: `components/layout/floating/whatsapp-button.tsx`

- [ ] **Step 15.1: WhatsApp butonunu yaz**

```typescript
// components/layout/floating/whatsapp-button.tsx
'use client';

import { motion } from 'framer-motion';
import { CONTACT } from '@/lib/constants';

export function WhatsAppButton() {
  return (
    <motion.a
      href={`https://wa.me/${CONTACT.whatsapp.replace(/[^0-9]/g, '')}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile iletişime geç"
      className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 transition-transform"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring' }}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488"/>
      </svg>
    </motion.a>
  );
}
```

- [ ] **Step 15.2: Commit**

```powershell
git add components/layout/floating/whatsapp-button.tsx
git commit -m "feat(layout): add WhatsApp floating button"
```

---

## Task 16: Mobile Sticky CTA

**Files:**
- Create: `components/layout/floating/mobile-cta.tsx`

- [ ] **Step 16.1: Mobile CTA yaz**

```typescript
// components/layout/floating/mobile-cta.tsx
'use client';

import Link from 'next/link';
import { Phone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CONTACT } from '@/lib/constants';

export function MobileCta() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden glass border-t border-[var(--color-border-glass)] p-3">
      <div className="flex gap-2">
        <Button asChild size="md" className="flex-1">
          <Link href="/teklif/al">
            <Sparkles className="h-4 w-4" />
            Ücretsiz Teklif Al
          </Link>
        </Button>
        <Button asChild variant="secondary" size="md">
          <a href={`tel:${CONTACT.phone}`} aria-label="Bizi ara">
            <Phone className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 16.2: Commit**

```powershell
git add components/layout/floating/mobile-cta.tsx
git commit -m "feat(layout): add mobile sticky CTA bar"
```

---

## Task 17: Cookie Consent Banner

**Files:**
- Create: `components/ui/cookie-banner.tsx`

- [ ] **Step 17.1: Cookie banner yaz**

```typescript
// components/ui/cookie-banner.tsx
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
          className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-[var(--color-border-glass)] p-4 md:bottom-4 md:left-4 md:right-auto md:max-w-md md:rounded-2xl md:border"
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
```

- [ ] **Step 17.2: Commit**

```powershell
git add components/ui/cookie-banner.tsx
git commit -m "feat(legal): add KVKK-compliant cookie consent banner"
```

---

## Task 18: Toaster (Bildirim Sistemi)

**Files:**
- Create: `components/ui/toaster.tsx`

- [ ] **Step 18.1: Sonner toaster wrapper'ı yaz**

```typescript
// components/ui/toaster.tsx
'use client';

import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from 'next-themes';

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <SonnerToaster
      theme={resolvedTheme as 'light' | 'dark' | 'system'}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        className: 'glass',
        duration: 4000,
      }}
    />
  );
}
```

- [ ] **Step 18.2: Commit**

```powershell
git add components/ui/toaster.tsx
git commit -m "feat(ui): add Toaster wrapper around sonner"
```

---

## Task 19: Tüm Floating'ları Tek Yerde Topla

**Files:**
- Create: `components/layout/floating/floating-stack.tsx`

- [ ] **Step 19.1: Floating stack yaz**

```typescript
// components/layout/floating/floating-stack.tsx
import { WhatsAppButton } from './whatsapp-button';
import { MobileCta } from './mobile-cta';
import { CookieBanner } from '@/components/ui/cookie-banner';
import { Toaster } from '@/components/ui/toaster';

export function FloatingStack() {
  return (
    <>
      <WhatsAppButton />
      <MobileCta />
      <CookieBanner />
      <Toaster />
    </>
  );
}
```

- [ ] **Step 19.2: Commit**

```powershell
git add components/layout/floating/floating-stack.tsx
git commit -m "feat(layout): add FloatingStack to compose floating UI"
```

---

## Task 20: Layout Entegrasyonu (Header + Footer + Floating)

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 20.1: Layout'u son haline getir**

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { CustomCursor } from '@/components/ui/cursor';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FloatingStack } from '@/components/layout/floating/floating-stack';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Zolarr — Güneşten Geleceğe',
  description: 'Türkiye\'nin güvenilir güneş enerjisi sistemleri firması.',
  metadataBase: new URL('https://zolarr.com.tr'),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}
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
```

- [ ] **Step 20.2: Commit**

```powershell
git add app/layout.tsx
git commit -m "feat(layout): integrate Header, Footer, CustomCursor, and FloatingStack into root layout"
```

---

## Task 21: Geçici Anasayfa (Faz 2'ye Kadar)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 21.1: Geçici anasayfa yaz**

```typescript
// app/page.tsx
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-24 md:px-6">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
          Güneşten Geleceğe
        </h1>
        <p className="mt-6 text-lg text-[var(--color-text-muted)]">
          Zolarr ile güneş enerjisi sistemleri kurulumunda Türkiye'nin güvenilir adresi.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/teklif/al">Ücretsiz Teklif Al</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/magaza">Mağazayı Keşfet</Link>
          </Button>
        </div>
      </section>

      <section className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardTitle>🏠 Konut</CardTitle>
          <CardDescription className="mt-2">
            Eviniz için kişiselleştirilmiş güneş enerjisi çözümleri.
          </CardDescription>
        </Card>
        <Card>
          <CardTitle>🏢 Ticari</CardTitle>
          <CardDescription className="mt-2">
            İşletmenize özel maliyet düşürücü güneş enerjisi sistemleri.
          </CardDescription>
        </Card>
        <Card>
          <CardTitle>🌾 Tarım</CardTitle>
          <CardDescription className="mt-2">
            Tarımsal sulama ve sera için ekonomik enerji çözümleri.
          </CardDescription>
        </Card>
      </section>

      <p className="mt-24 text-center text-sm text-[var(--color-text-muted)]">
        Bu geçici anasayfa Faz 2'de tam tasarımla değiştirilecek.
      </p>
    </div>
  );
}
```

- [ ] **Step 21.2: Commit**

```powershell
git add app/page.tsx
git commit -m "feat(home): add temporary homepage placeholder for Phase 2"
```

---

## Task 22: 404 Sayfası

**Files:**
- Create: `app/not-found.tsx`

- [ ] **Step 22.1: 404 sayfası yaz**

```typescript
// app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-9xl font-bold text-[var(--color-brand)]">404</p>
      <h1 className="mt-6 font-display text-3xl font-bold">Sayfa bulunamadı</h1>
      <p className="mt-4 text-[var(--color-text-muted)] max-w-md">
        Aradığınız sayfa kaldırılmış olabilir veya hiç var olmamış olabilir.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/">Anasayfaya Dön</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/iletisim">İletişim</Link>
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 22.2: Commit**

```powershell
git add app/not-found.tsx
git commit -m "feat(error): add 404 not-found page"
```

---

## Task 23: Environment ve Supabase Hazırlığı

**Files:**
- Create: `.env.example`
- Modify: `.env.local`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`

- [ ] **Step 23.1: .env.example oluştur**

```bash
# .env.example - Şablon (gerçek değerler .env.local'e yazılır, commit edilmez)

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase (https://supabase.com/dashboard'tan al)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (Supabase > Project Settings > Database > Connection String)
DATABASE_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres

# Anthropic (Faz 5'te aktif olacak)
ANTHROPIC_API_KEY=

# Resend (Faz 4+'da aktif olacak)
RESEND_API_KEY=

# Admin bootstrap
SEED_ADMIN_EMAIL=admin@zolarr.com.tr
```

- [ ] **Step 23.2: .env.local'i güncelle**

`.env.local` dosyası mevcut değilse oluştur (Next.js kurulumu otomatik üretmiş olabilir). İçine `.env.example`'daki anahtarları kopyala. Şimdilik **NEXT_PUBLIC_SITE_URL** dışındakiler boş kalabilir — Faz 23.4'te Supabase setup yapılınca dolacaklar.

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 23.3: .gitignore'da .env.local olduğunu doğrula**

`.gitignore` dosyasında şu satırın olması gerekiyor (Next.js otomatik ekler, doğrula):

```
.env*.local
```

- [ ] **Step 23.4: Supabase projesi oluştur (manuel adım — kullanıcı yapacak)**

Bu adım **kullanıcının** yapması gerekiyor:
1. https://supabase.com adresine git, kayıt ol / giriş yap
2. "New project" tıkla
3. Proje adı: `zolarr`
4. Database password belirle (kaydet, sonra kullanılacak)
5. Region: Frankfurt (Türkiye'ye yakın)
6. Plan: Free
7. Proje oluşunca → Project Settings → API
8. URL ve anon key'i `.env.local`'e yapıştır
9. Project Settings → Database → Connection string → URI'yi `.env.local`'e yapıştır

⚠️ Bu adım tamamlanana kadar Task 23.5 ve 24 atlanabilir, daha sonra dönülür.

- [ ] **Step 23.5: Supabase client'ları oluştur**

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component'ten gelen çağrı, sessiz geç
          }
        },
      },
    }
  );
}
```

- [ ] **Step 23.6: Commit**

```powershell
git add .env.example lib/supabase/
git commit -m "feat(supabase): add Supabase browser and server clients with .env.example"
```

---

## Task 24: Drizzle ORM ve İlk Şema

**Files:**
- Create: `drizzle.config.ts`
- Create: `lib/db/index.ts`
- Create: `lib/db/schema.ts`

- [ ] **Step 24.1: drizzle.config.ts oluştur**

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

- [ ] **Step 24.2: lib/db/index.ts oluştur**

```typescript
// lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
```

- [ ] **Step 24.3: İlk şema (users + site_settings)**

```typescript
// lib/db/schema.ts
import { pgTable, uuid, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['customer', 'moderator', 'assistant', 'admin']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  phone: text('phone'),
  role: userRoleEnum('role').notNull().default('customer'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Type exports (frontend için)
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type SiteSetting = typeof siteSettings.$inferSelect;
```

- [ ] **Step 24.4: Şemayı veritabanına push et (Supabase setup yapıldıysa)**

⚠️ Sadece Task 23.4 tamamlandıysa çalıştır:

```powershell
npm run db:push
```

Beklenen: "Pulling schema..." → "Pushing schema..." → "✓ Done"
Supabase Dashboard → Table Editor'da `users` ve `site_settings` tabloları görünmeli.

- [ ] **Step 24.5: Commit**

```powershell
git add drizzle.config.ts lib/db/
git commit -m "feat(db): configure Drizzle ORM with initial users and site_settings schema"
```

---

## Task 25: Smoke Test — Sayfa Yüklenebilirlik Doğrulaması

**Files:**
- Create: `tests/smoke-page.test.tsx`

- [ ] **Step 25.1: Smoke test yaz**

```typescript
// tests/smoke-page.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/providers/theme-provider';
import HomePage from '@/app/page';

describe('Anasayfa Smoke Test', () => {
  it('hata atmadan render eder', () => {
    render(
      <ThemeProvider>
        <HomePage />
      </ThemeProvider>
    );
    expect(screen.getByText(/Güneşten Geleceğe/i)).toBeInTheDocument();
  });

  it('CTA butonlarını gösterir', () => {
    render(
      <ThemeProvider>
        <HomePage />
      </ThemeProvider>
    );
    expect(screen.getByRole('link', { name: /ücretsiz teklif al/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /mağazayı keşfet/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 25.2: Tüm test'leri çalıştır**

```powershell
npm test -- --run
```

Beklenen: Tüm testler PASS (button, card, input, logo, theme-toggle, header, footer, smoke).

- [ ] **Step 25.3: Build doğrulaması**

```powershell
npm run build
```

Beklenen: "Compiled successfully" + 0 hata.

- [ ] **Step 25.4: Manuel görsel QA — dev server**

```powershell
npm run dev
```

Tarayıcıda kontrol et:
- [ ] `http://localhost:3000` açılıyor
- [ ] Header sticky, scroll'da glass efekt veriyor
- [ ] Logo + "Zolarr" yazısı görünür
- [ ] Tüm navigasyon linkleri tıklanabilir (hata sayfasına gitmesin diye geçici, henüz sayfalar yok — 404 ile karşılaşacak ki bu beklenen)
- [ ] Tema toggle çalışıyor: dark → light → dark, geçişlerde flicker yok
- [ ] **Light mode'da**: Tüm yazılar okunaklı, butonlar görünür, kontrast yeterli
- [ ] **Dark mode'da**: Aynı kontrol
- [ ] Mouse hareket ettir → cursor halkası takip ediyor
- [ ] Bir butona yaklaş → halka büyüyor
- [ ] Tıkla → yeşil dalga efekti
- [ ] Mobile view (DevTools, 375px): hamburger menü açılıyor, mobile sticky CTA görünür
- [ ] Mobile'da custom cursor görünmüyor (touch device)
- [ ] WhatsApp butonu sağ altta sabit
- [ ] Cookie banner ilk girişte görünür, "Kabul Et" → kaybolur, refresh sonrası tekrar gelmez (localStorage)
- [ ] Footer'da tüm linkler görünür, sosyal medya ikonları var
- [ ] `/olmayan-sayfa` → 404 sayfası gösteriyor

- [ ] **Step 25.5: Commit**

```powershell
git add tests/smoke-page.test.tsx
git commit -m "test: add page smoke test and final Phase 0+1 validation"
```

---

## Task 26: Phase 0+1 Tamamlanma Belgesi

**Files:**
- Create: `docs/superpowers/plans/2026-05-05-faz-0-1-completion.md`

- [ ] **Step 26.1: Tamamlanma belgesi yaz**

```markdown
# Faz 0+1 Tamamlanma Raporu

**Tarih:** [bugünün tarihi]
**Durum:** ✅ Tamamlandı

## Tamamlanan Görevler

- [x] Task 1: Next.js 15 init
- [x] Task 2: Bağımlılıklar
- [x] Task 3: Vitest setup
- [x] Task 4: Tailwind 4 + Design tokens
- [x] Task 5: Fontlar
- [x] Task 6: utils.ts + constants.ts
- [x] Task 7: Logo
- [x] Task 8: Button
- [x] Task 9: Card
- [x] Task 10: Input
- [x] Task 11: Theme provider + toggle
- [x] Task 12: Custom cursor
- [x] Task 13: Header
- [x] Task 14: Footer
- [x] Task 15: WhatsApp
- [x] Task 16: Mobile CTA
- [x] Task 17: Cookie banner
- [x] Task 18: Toaster
- [x] Task 19: Floating stack
- [x] Task 20: Layout integration
- [x] Task 21: Geçici anasayfa
- [x] Task 22: 404
- [x] Task 23: Supabase + env
- [x] Task 24: Drizzle + ilk şema
- [x] Task 25: Smoke test + manuel QA

## Sonraki Adım

**Faz 2 — Anasayfa**: Hero banner, ürün/kampanya yatay slider, 12 bölümlü tam anasayfa.

`docs/superpowers/plans/` altına yeni plan yazılacak (`writing-plans` skill'i kullanılarak).
```

- [ ] **Step 26.2: Final commit**

```powershell
git add docs/superpowers/plans/2026-05-05-faz-0-1-completion.md
git commit -m "docs: Phase 0+1 completion report"
```

---

## Self-Review Checklist (Engineer Tarafından — İmplementasyon Sonrası)

### Spec Coverage (Faz 0+1 için)

- [x] Next.js 15 + TypeScript strict (Task 1)
- [x] Tailwind CSS 4 + Cyber Lime + Glassmorphism token'lar (Task 4)
- [x] Fontlar: Space Grotesk + Inter + JetBrains Mono (Task 5)
- [x] Button sistemi: Primary, Secondary, Ghost, Destructive, Icon variantları (Task 8)
- [x] Card sistemi: Glass + Elevated (Task 9)
- [x] Input (Task 10)
- [x] Logo (Task 7)
- [x] Custom cursor + tıklama dalga efekti + mobile'da kapalı + reduced-motion respect (Task 12)
- [x] Theme toggle (dark/light/system) — geçişlerde görünürlük korundu (Task 11, doğrulama 25.4)
- [x] Sticky header + scroll glass efekti (Task 13)
- [x] Mobile menu drawer (Task 13)
- [x] 4 sütunlu footer + sosyal medya + bülten kayıt (Task 14)
- [x] WhatsApp floating (Task 15)
- [x] Mobile sticky CTA (Task 16)
- [x] KVKK çerez banner (Task 17)
- [x] Toast bildirim sistemi (Task 18)
- [x] Supabase entegrasyonu (Task 23)
- [x] Drizzle ORM + ilk şema (Task 24)
- [x] 404 sayfası (Task 22)
- [x] Smoke test + build doğrulaması (Task 25)

### Faz 0+1 Sonrası Beklenen Çıktı

✅ Çalışan bir Next.js sitesi  
✅ Header + Footer + Floating elemanlar  
✅ Tema değiştirilebilir, görünürlük garantili  
✅ Custom cursor (desktop) çalışıyor  
✅ Tüm UI primitif bileşenler test'li  
✅ Veritabanı bağlı, ilk tablolar oluşmuş  
✅ Geçici anasayfa + 404 var  
✅ Build hatasız geçiyor  
❌ Henüz: Anasayfa içeriği (Faz 2), e-mağaza (Faz 3), AI asistan (Faz 5), admin (Faz 8) vs.
