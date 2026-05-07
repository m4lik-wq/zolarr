/**
 * Bootstrap tracker: önceden manuel uygulanmış v2..v8 dosyalarını
 * _migrations_applied tablosuna ekler. Bir kez çalıştırılır.
 */
import { config as loadEnv } from 'dotenv';
import { Client } from 'pg';

loadEnv({ path: '.env.local' });
loadEnv();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL yok');
  const client = new Client({ connectionString: url });
  await client.connect();
  const files = ['v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8'].map(
    (v) => `combined_for_paste_${v}.sql`
  );
  for (const f of files) {
    await client.query(
      'insert into public._migrations_applied(filename) values ($1) on conflict do nothing',
      [f]
    );
    console.log(`✅ ${f} işaretlendi (zaten uygulanmış)`);
  }
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
