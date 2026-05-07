// scripts/qa/auth.ts
import type { BrowserContext } from '@playwright/test';

export interface AuthCreds {
  email: string;
  password: string;
}

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function loginAdmin(context: BrowserContext, creds: AuthCreds): Promise<void> {
  const page = await context.newPage();
  await page.goto(`${BASE}/giris`, { waitUntil: 'domcontentloaded', timeout: 15_000 });
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);
  await page.click('button[type="submit"]');
  // Wait for redirect away from /giris
  try {
    await page.waitForURL((url) => !url.pathname.startsWith('/giris'), { timeout: 10_000 });
  } catch {
    throw new Error('Admin login zaman aşımına uğradı; e-posta/şifre yanlış olabilir.');
  }
  await page.close();
}
