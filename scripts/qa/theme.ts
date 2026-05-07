// scripts/qa/theme.ts
import type { BrowserContext, Page } from '@playwright/test';

export type Theme = 'light' | 'dark';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function setTheme(context: BrowserContext, theme: Theme): Promise<void> {
  // next-themes uses localStorage 'theme' key; injected before any page script runs
  await context.addInitScript((t) => {
    try {
      localStorage.setItem('theme', t as string);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(t as string);
    } catch {
      // localStorage may not be available pre-navigation
    }
  }, theme);
}

export async function navigateWithTheme(page: Page, path: string, theme: Theme): Promise<void> {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 15_000 });
  // Re-apply tema sınıfını next-themes hidrasyon sonrası override etmemek için
  await page.evaluate((t) => {
    localStorage.setItem('theme', t);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(t);
  }, theme);
  // Brief settle for re-render
  await page.waitForTimeout(400);
}
