import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.local' });
loadEnv();

async function main() {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('❌ CRON_SECRET .env.local içinde tanımlı değil. Önce ekleyin.');
    process.exit(1);
  }
  console.log(`🔄 ${url}/api/cron/sync-suppliers tetikleniyor...`);
  const res = await fetch(`${url}/api/cron/sync-suppliers`, {
    headers: { authorization: `Bearer ${secret}` },
  });
  const body = await res.json();
  console.log(JSON.stringify(body, null, 2));
  if (!res.ok) {
    console.error(`❌ HTTP ${res.status}`);
    process.exit(1);
  }
  console.log('✅ Sync tamamlandı.');
}

main().catch((e) => {
  console.error('❌ Hata:', e);
  process.exit(1);
});
