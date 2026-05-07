import type { BrowserContext } from '@playwright/test';

export interface AuthCreds {
  email: string;
  password: string;
}

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function loginAdmin(context: BrowserContext, creds: AuthCreds): Promise<void> {
  const page = await context.newPage();
  try {
    await page.goto(`${BASE}/giris`, { waitUntil: 'networkidle', timeout: 20_000 });

    // Login form uses #login-email and #login-password (see components/auth/login-form.tsx)
    await page.locator('#login-email').waitFor({ state: 'visible', timeout: 10_000 });
    await page.locator('#login-email').fill(creds.email);
    await page.locator('#login-password').fill(creds.password);

    // Submit + wait for navigation (race)
    const submit = page.getByRole('button', { name: /giriş yap/i });
    await submit.waitFor({ state: 'visible', timeout: 5_000 });

    await Promise.all([
      page.waitForURL((url) => !url.pathname.startsWith('/giris'), { timeout: 15_000 }).catch(() => null),
      submit.click(),
    ]);

    // Brief settle for any post-redirect work
    await page.waitForTimeout(800);

    // Verify success
    const currentUrl = page.url();
    if (currentUrl.includes('/giris')) {
      const errorText = await page
        .locator('[role="alert"], .text-\\[var\\(--color-danger\\)\\]')
        .first()
        .textContent()
        .catch(() => null);
      const detail = errorText
        ? `Form hatası: "${errorText.trim()}"`
        : 'Sayfa yönlendirilmedi — şifre yanlış veya hidrasyon problemi olabilir';
      throw new Error(`Admin login başarısız. ${detail}`);
    }
  } finally {
    await page.close();
  }
}
