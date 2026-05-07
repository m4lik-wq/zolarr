import { config as loadEnv } from 'dotenv';
import { chromium, type Browser, type BrowserContext } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { ROUTES } from './qa/routes';
import { resolveSampleIds, fillRoute } from './qa/resolve-ids';
import { loginAdmin } from './qa/auth';
import { setTheme, navigateWithTheme, type Theme } from './qa/theme';

loadEnv({ path: '.env.local' });
loadEnv();

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812 },
] as const;

const THEMES: Theme[] = ['light', 'dark'];

const OUT_DIR = join(process.cwd(), 'screenshots');

async function launchBrowser(): Promise<Browser> {
  // Windows 10/11'de Edge garanti yüklü; Chrome çoğu sistemde var.
  // Bu sayede `npx playwright install chromium` (150MB) gerekmez.
  const candidates: Array<'msedge' | 'chrome'> = ['msedge', 'chrome'];
  for (const channel of candidates) {
    try {
      const b = await chromium.launch({ channel, headless: true });
      console.log(`🚀 Browser: ${channel} (sistem yüklü)`);
      return b;
    } catch {
      console.log(`   ${channel} bulunamadı, sıradakine geçiliyor...`);
    }
  }
  // Son çare: Playwright'ın indirdiği Chromium (yoksa burada hata verir)
  try {
    const b = await chromium.launch({ headless: true });
    console.log('🚀 Browser: bundled Chromium');
    return b;
  } catch (e) {
    console.error('❌ Hiçbir browser bulunamadı.');
    console.error('   Sisteminizde Microsoft Edge veya Chrome olmalı.');
    console.error('   Veya: npx playwright install chromium (150MB indirme)');
    console.error(`   Detay: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }
}

async function main() {
  // Single-route mode: npm run qa:screenshot -- <slug>
  const onlySlug = process.argv[2];

  console.log('🔍 Sample id\'leri çekiliyor...');
  const ids = await resolveSampleIds();
  console.log('   ', ids);

  // Sistem browser kullan (indirme gerekmesin) — sırayla Edge → Chrome → bundled Chromium
  const browser = await launchBrowser();

  const adminEmail = process.env.QA_ADMIN_EMAIL;
  const adminPassword = process.env.QA_ADMIN_PASSWORD;

  const publicCtx = await browser.newContext();
  const adminCtx = await browser.newContext();

  if (adminEmail && adminPassword) {
    console.log(`🔑 Admin olarak giriş yapılıyor (${adminEmail})...`);
    try {
      await loginAdmin(adminCtx, { email: adminEmail, password: adminPassword });
      console.log('✅ Admin oturumu açıldı.');
    } catch (e) {
      console.error(`❌ Admin login başarısız: ${e instanceof Error ? e.message : String(e)}`);
      console.error('   Admin sayfaları atlanacak.');
    }
  } else {
    console.warn('⚠️  QA_ADMIN_EMAIL/PASSWORD .env.local\'da yok — admin sayfaları atlanacak');
  }

  let captured = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const route of ROUTES) {
    if (onlySlug && route.slug !== onlySlug) continue;

    const filledPath = fillRoute(route.path, ids, route.idFrom, route.idType ?? 'id');
    if (!filledPath) {
      skipped++;
      console.log(`⏭️  ${route.slug}: id resolve edilemedi (DB'de kayıt yok), atlanıyor`);
      continue;
    }

    if ((route.auth === 'admin' || route.auth === 'user') && (!adminEmail || !adminPassword)) {
      skipped++;
      continue;
    }

    const ctx: BrowserContext =
      route.auth === 'admin' || route.auth === 'user' ? adminCtx : publicCtx;

    const dir = join(OUT_DIR, route.slug);
    await mkdir(dir, { recursive: true });

    process.stdout.write(`📸 ${route.slug.padEnd(30)} `);

    for (const viewport of VIEWPORTS) {
      for (const theme of THEMES) {
        const page = await ctx.newPage();
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await setTheme(ctx, theme);
        try {
          await navigateWithTheme(page, filledPath, theme);
          const file = join(dir, `${viewport.name}-${theme}.png`);
          await page.screenshot({ path: file, fullPage: true });
          captured++;
          process.stdout.write('.');
        } catch (e) {
          failures.push(
            `${route.slug} ${viewport.name}-${theme}: ${e instanceof Error ? e.message : String(e)}`,
          );
          process.stdout.write('x');
        }
        await page.close();
      }
    }
    process.stdout.write('\n');
  }

  await browser.close();

  console.log(`\n✅ Tamamlandı: ${captured} screenshot, ${skipped} sayfa atlandı, ${failures.length} hata`);
  if (failures.length > 0) {
    console.log('Hatalar:');
    for (const f of failures) console.log(`  - ${f}`);
  }
  console.log(`📂 Çıktı: ${OUT_DIR}`);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
